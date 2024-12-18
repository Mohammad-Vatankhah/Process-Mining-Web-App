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

export interface Result {
  alphaMiner: PetriNet | null;
  heuristicMiner: PetriNet | null;
  inductiveMiner: PetriNet | null;
  ilpMiner: PetriNet | null;
  dfg: Record<string, number> | null;
  socialNetwork: Record<string, string[]> | null;
  footprint: Footprint | null;
}

export interface Footprint {
  footprint: string;
}
