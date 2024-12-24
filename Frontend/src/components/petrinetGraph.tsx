import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { PetriNet, Result } from "@/types/types";
import { FaInfoCircle } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import toast from "react-hot-toast";
import PMapi from "@/API/pmAPI";
import { AxiosError } from "axios";

cytoscape.use(dagre);

const PetriNetGraph: React.FC<{
  petrinet: PetriNet;
  algorithm: string;
  setResult: Dispatch<SetStateAction<Result>>;
  filename: string;
}> = ({ petrinet, algorithm, setResult, filename }) => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
  });
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState("none");

  const elements = React.useMemo(() => {
    const regex =
      /\(\{(?:'[^']*'(?:,\s*)?)+\}(?:,\s*\{(?:'[^']*'(?:,\s*)?)*\})*\)/;
    const initialNodes: string[] = JSON.parse(
      petrinet.im.replace(/'/g, '"')
    ).map((label: string) => label.split(":")[0]);
    const finalNodes: string[] = JSON.parse(petrinet.fm.replace(/'/g, '"')).map(
      (label: string) => label.split(":")[0]
    );

    const nodes = [
      ...petrinet.net.places.map((place) => {
        const circleNode =
          place.label.startsWith("intplace_") ||
          place.label.startsWith("splace_") ||
          place.label.startsWith("pre_") ||
          regex.test(place.label);
        const isStartNode = initialNodes.includes(place.label);
        const isFinalNode = finalNodes.includes(place.label);
        const isNumericalNode = /^\d+$/.test(place.label);
        return {
          data: {
            id: place.id,
            label: isStartNode ? "Start" : isFinalNode ? "End" : place.label,
          },
          classes: isStartNode
            ? "startNode"
            : isFinalNode
            ? "finalNode"
            : circleNode || isNumericalNode
            ? "circleNode"
            : "defaultNode",
        };
      }),
      ...petrinet.net.transitions.map((transition) => ({
        data: { id: transition.id, label: transition.label },
        classes: transition.label.startsWith("hid_")
          ? "hidNode"
          : "defaultNode",
      })),
    ];

    const edges = petrinet.net.arcs.map((arc) => ({
      data: {
        id: arc.id,
        source: arc.source,
        target: arc.target,
      },
    }));

    return [...nodes, ...edges];
  }, [petrinet]);

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.layout({ name: "dagre", rankDir: "LR" }).run();

      // Right-click listener for nodes
      cyRef.current.on("cxttap", "node", (event) => {
        const node: cytoscape.NodeSingular = event.target;
        const containerRect = containerRef.current?.getBoundingClientRect();

        const nodeClasses = node.classes();
        if (
          nodeClasses.includes("circleNode") ||
          nodeClasses.includes("hidNode") ||
          nodeClasses.includes("startNode") ||
          nodeClasses.includes("finalNode")
        ) {
          return;
        }

        if (containerRect) {
          setContextMenu({
            visible: true,
            x: event.originalEvent.clientX - containerRect.left,
            y: event.originalEvent.clientY - containerRect.top,
            nodeId: node.data("label"),
          });
        }
      });
    }

    const handleClick = () =>
      setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [elements]);

  const handleExport = () => {
    if (cyRef.current) {
      const pngData = cyRef.current.png({ full: true, bg: "white" });
      const link = document.createElement("a");
      link.href = pngData;
      link.download = "petrinet_graph.png";
      link.click();
    }
  };

  const handleResetPosition = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };

  const handleMenuAction = (nodeId: string) => {
    setSelectedNodes((prev) =>
      prev.includes(nodeId) ? prev : [...prev, nodeId]
    );
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
  };

  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleApplyFilter = async () => {
    if (selectedNodes.length === 0) {
      toast.error("Please select a node to filter");
      return;
    }
    try {
      setLoading(algorithm);
      const res = await PMapi.filterActivities(
        filename,
        selectedNodes,
        algorithm
      );
      if (algorithm === "Alpha Miner") {
        setResult((prev) => ({ ...prev, alphaMiner: res.data }));
      } else if (algorithm === "Heuristic Miner") {
        setResult((prev) => ({ ...prev, heuristicMiner: res.data }));
      } else if (algorithm === "ILP Miner") {
        setResult((prev) => ({ ...prev, ilpMiner: res.data }));
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.msg);
      } else {
        toast.error("An unexpected error occurred!");
      }
    } finally {
      setLoading("none");
    }
  };

  const handleResetFilter = async () => {
    try {
      setLoading(algorithm);
      if (algorithm === "Alpha Miner") {
        const res = await PMapi.alphaMiner(filename);
        setResult((prev) => ({ ...prev, alphaMiner: res.data }));
      } else if (algorithm === "Heuristic Miner") {
        const res = await PMapi.heuristicMiner(filename);
        setResult((prev) => ({ ...prev, heuristicMiner: res.data }));
      }
      setSelectedNodes([]);
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.msg);
      } else {
        toast.error("An unexpected error occurred!");
      }
    } finally {
      setLoading("none");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="font-bold text-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {algorithm} Algorithm Result
            <Dialog>
              <DialogTrigger asChild>
                <FaInfoCircle size={15} className="mt-1 cursor-pointer" />
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>
                  <h2 className="text-xl font-bold">Interactive Graph</h2>
                </DialogTitle>
                <div className="mt-2 font-bold text-balance text-gray-600">
                  <p>This graph is interactive. You can:</p>
                  <ul className="list-disc font-normal list-inside mt-2">
                    <li>Right-click on a node to access more options.</li>
                    <li>Pan and zoom the graph to explore it better.</li>
                    <li>Export the graph as a PNG using the export button.</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Select Nodes to Filter</Button>
              </PopoverTrigger>
              <PopoverContent>
                <h3 className="text-sm font-bold mb-2">Select Nodes</h3>
                <div className="p-2 max-h-52 overflow-auto">
                  {elements
                    .filter((el) => el.data.id && el.classes === "defaultNode")
                    .map((el) => (
                      <div key={el.data.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedNodes.includes(el.data.label)}
                          onCheckedChange={() =>
                            toggleNodeSelection(el.data.label)
                          }
                        />
                        <label>{el.data.label}</label>
                      </div>
                    ))}
                </div>
                <Button className="mt-3" onClick={handleResetFilter}>
                  Reset Filter
                </Button>
              </PopoverContent>
            </Popover>
            <Button onClick={handleApplyFilter}>Apply Filter</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading === algorithm && (
          <div className="z-10 bg-gray-400 h-[500px] w-full">Loading...</div>
        )}
        <div
          ref={containerRef}
          className={`relative h-[500px] w-full ${
            loading === algorithm && "hidden"
          }`}
          onContextMenu={(e) => e.preventDefault()}
        >
          <CytoscapeComponent
            elements={elements}
            stylesheet={[
              {
                selector: ".circleNode",
                style: {
                  width: 80,
                  height: 80,
                  "background-color": "#ccc",
                  border: "1px solid rgba(0, 0, 0)",
                  "text-valign": "center",
                  "text-halign": "center",
                },
              },
              {
                selector: ".hidNode",
                style: {
                  width: "100px",
                  height: "50px",
                  "background-color": "black",
                  shape: "rectangle",
                  color: "transparent",
                },
              },
              {
                selector: ".defaultNode",
                style: {
                  label: "data(label)",
                  width: "label",
                  height: 40,
                  "background-color": "#ccc",
                  "text-valign": "center",
                  "text-halign": "center",
                  shape: "round-rectangle",
                  padding: "10px",
                },
              },
              {
                selector: ".startNode",
                style: {
                  width: 80,
                  height: 80,
                  "background-color": "blue",
                  border: "1px solid rgba(0, 0, 0)",
                  "text-valign": "center",
                  "text-halign": "center",
                  label: "data(label)",
                  color: "white",
                },
              },
              {
                selector: ".finalNode",
                style: {
                  width: 80,
                  height: 80,
                  "background-color": "#fdae61",
                  border: "1px solid rgba(0, 0, 0)",
                  "text-valign": "center",
                  "text-halign": "center",
                  label: "data(label)",
                  color: "white",
                },
              },
              {
                selector: "edge",
                style: {
                  "target-arrow-shape": "triangle",
                  "curve-style": "bezier",
                  width: 2,
                },
              },
            ]}
            style={{ width: "100%", height: "500px", backgroundColor: "white" }}
            cy={(cy) => (cyRef.current = cy)}
          />
          {contextMenu.visible && (
            <div
              style={{
                position: "absolute",
                top: contextMenu.y,
                left: contextMenu.x,
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "5px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                zIndex: 10,
              }}
            >
              <ul className="list-none m-0">
                {selectedNodes.includes(contextMenu.nodeId!) ? (
                  <li
                    className="hover:bg-destructive hover:text-white rounded-sm cursor-pointer p-2 transition-all duration-200"
                    onClick={() => toggleNodeSelection(contextMenu.nodeId!)}
                  >
                    Remove Node from Filter
                  </li>
                ) : (
                  <li
                    className="hover:bg-[#00ADB5] hover:text-white rounded-sm cursor-pointer p-2 transition-all duration-200"
                    onClick={() => handleMenuAction(contextMenu.nodeId!)}
                  >
                    Add Node to Filter
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button onClick={handleExport}>Export as PNG</Button>
        <Button onClick={handleResetPosition}>Reset Position</Button>
      </CardFooter>
    </Card>
  );
};

export default PetriNetGraph;
