export interface User {
  id: string;
  email: string;
  name: string;
}

type Arc = {
  id: string;
  source: string;
  target: string;
};

type Place = {
  id: string;
  label: string;
};

type Transition = {
  id: string;
  label: string;
};

type PetriNetGraphProps = {
  arcs: Arc[];
  places: Place[];
  transitions: Transition[];
};

export type PetriNet = {
  net: PetriNetGraphProps;
  fm: string;
  im: string;
};

type BPMNEdge = {
  source: string;
  target: string;
};

type BPMNNode = {
  data: string;
  id: string;
  type: string;
};

export type BPMN = {
  edges: BPMNEdge[];
  nodes: BPMNNode[];
};

export interface Result {
  alphaMiner: PetriNet | null;
  heuristicMiner: PetriNet | null;
  inductiveMiner: PetriNet | null;
  ilpMiner: PetriNet | null;
  bpmn: BPMN | null;
  dfg: Record<string, number> | null;
  socialNetwork: Record<string, string[]> | null;
  footprint: Footprint | null;
}

export interface Footprint {
  footprint: string;
}

export type AlignmentData = {
  alignment: [string, string][]; // An array of tuples with string and optional null values
  bwc: number; // Best Worst Case cost
  cost: number; // Alignment cost
  fitness: number; // Fitness value
  lp_solved: number; // Number of LP problems solved
  queued_states: number; // Number of states queued
  traversed_arcs: number; // Number of arcs traversed
  visited_states: number; // Number of states visited
};
