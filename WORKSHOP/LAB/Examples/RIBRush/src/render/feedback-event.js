function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function routeDisplayData(route, label) {
  if (!route || typeof route !== "object" || Array.isArray(route)) {
    throw new TypeError(`${label} must be a route object`);
  }
  if (!Number.isInteger(route.prefixLength) || route.prefixLength < 0) {
    throw new TypeError(`${label} has an invalid prefix length`);
  }
  return Object.freeze({
    id: requireString(route.id, `${label} ID`),
    nextHopId: requireString(route.nextHopId, `${label} next-hop ID`),
    nextHopLabel: requireString(route.nextHopLabel, `${label} next-hop label`),
    networkAddress: requireString(route.networkAddress, `${label} network address`),
    prefixLength: route.prefixLength,
  });
}

export function createDecisionFeedbackEvent({
  scenario,
  evaluation,
  selectedNextHopId,
  decisionStatus,
  explanation,
}) {
  if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) {
    throw new TypeError("Scenario must be an object");
  }
  if (!scenario.packet || typeof scenario.packet !== "object") {
    throw new TypeError("Scenario packet is required");
  }
  if (!Array.isArray(scenario.routes)) {
    throw new TypeError("Scenario routes must be an array");
  }
  if (!evaluation || typeof evaluation !== "object") {
    throw new TypeError("Route evaluation is required");
  }
  if (decisionStatus !== "correct" && decisionStatus !== "wrong") {
    throw new TypeError("Decision status must be correct or wrong");
  }

  const selectedHopId = requireString(selectedNextHopId, "Selected next-hop ID");
  const winnerRouteId = requireString(evaluation.winnerRouteId, "Winning route ID");
  const selectedRouteIndex = scenario.routes.findIndex(
    (route) => route?.nextHopId === selectedHopId,
  );
  const winningRouteIndex = scenario.routes.findIndex(
    (route) => route?.id === winnerRouteId,
  );
  if (selectedRouteIndex < 0) {
    throw new Error(`Selected next hop is not present in the scenario: ${selectedHopId}`);
  }
  if (winningRouteIndex < 0) {
    throw new Error(`Winning route is not present in the scenario: ${winnerRouteId}`);
  }
  const routes = Object.freeze(
    scenario.routes.map((route, index) =>
      routeDisplayData(route, `Route ${index + 1}`),
    ),
  );

  return Object.freeze({
    packetId: requireString(scenario.packet.id, "Packet ID"),
    selectedNextHopId: selectedHopId,
    selectedRouteIndex,
    winningRouteIndex,
    winningRouteId: winnerRouteId,
    decisionStatus,
    destination: requireString(scenario.packet.destination, "Packet destination"),
    routes,
    selectedRoute: routes[selectedRouteIndex],
    winningRoute: routes[winningRouteIndex],
    ruleCode: requireString(evaluation.ruleCode, "Decision rule code"),
    explanation: requireString(explanation, "Decision explanation"),
  });
}
