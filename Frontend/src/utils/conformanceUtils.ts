export const classifyAlignment = (event: string, transition: string) => {
  if (event !== ">>" && transition !== ">>" && event === transition) {
    return "Sync move"; // event and transition labels correspond
  }

  if (event === ">>" && transition !== ">>") {
    return "Move on log"; // transition is ">>", indicating a move in the trace
  }

  if (transition === ">>" && event !== ">>") {
    return "Move on model"; // event is ">>", indicating a move in the model
  }

  // Further classify moves on the model
  if (transition === ">>" && event === ">>") {
    return "Move on model involving hidden transitions"; // Fit move (if it's a hidden transition)
  }

  return "Move on model not involving hidden transitions"; // Unfit move
};
