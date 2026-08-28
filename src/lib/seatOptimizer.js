/**
 * RailTogether's deterministic, local-only seating simulation.
 * It uses invented coaches and seats only; it is not connected to any railway
 * operator and cannot predict real availability or booking outcomes.
 */

export const OPTIMIZER_WEIGHTS = {
  sameCoach: 30,
  familiesTogether: 30,
  childrenNearFamily: 15,
  seniorsNearFamily: 15,
  selectedPriorityBonus: 10,
}

const INVENTED_SEATS = {
  'vande-bharat': {
    S4: [41, 42, 43, 44, 46, 47, 48, 49, 50, 52],
    S5: [41, 42, 43, 44, 46, 47],
  },
  'intercity-express': {
    S4: [41, 43, 44, 46, 48, 50],
    S5: [41, 42, 44, 45, 47, 48, 50],
  },
  'jan-shatabdi': {
    S4: [41, 42, 43, 45, 46, 47, 49, 50, 52],
    S5: [41, 42, 43, 45, 46, 48],
  },
}

export function getSyntheticSeatsForTrain(trainId) {
  const seats = INVENTED_SEATS[trainId] || INVENTED_SEATS['vande-bharat']
  return Object.entries(seats).flatMap(([coach, numbers]) => numbers.map((seat) => ({ coach, seat })))
}

const average = (numbers) => numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0

function seatDistance(first, second) {
  return first.coach === second.coach ? Math.abs(first.seat - second.seat) : 12
}

function groupPassengers(passengers) {
  return Object.values(passengers.reduce((groups, passenger) => {
    groups[passenger.group] = [...(groups[passenger.group] || []), passenger]
    return groups
  }, {}))
}

/**
 * Greedily assigns whole groups into the most suitable invented coach first.
 * It then uses the nearest remaining seat if a group cannot fit in one coach.
 * The tie breakers are fixed, so the same inputs always return the same plan.
 */
function assignSeats(passengers, availableSeats, preferences) {
  const remaining = availableSeats.reduce((coaches, seat) => {
    coaches[seat.coach] = [...(coaches[seat.coach] || []), seat]
    return coaches
  }, {})
  Object.values(remaining).forEach((seats) => seats.sort((a, b) => a.seat - b.seat))
  const assignments = []
  const groups = groupPassengers(passengers)
    .sort((first, second) => second.length - first.length || first[0].group.localeCompare(second[0].group))
  const usedCoachCounts = {}

  for (const group of groups) {
    const coachNames = Object.keys(remaining).sort((first, second) => {
      const firstSeats = remaining[first].length
      const secondSeats = remaining[second].length
      const firstReuse = usedCoachCounts[first] || 0
      const secondReuse = usedCoachCounts[second] || 0
      const preferReuse = preferences.sameCoach || preferences.priority === 'same coach'
      const firstScore = firstSeats * 10 + (preferReuse ? firstReuse * 4 : 0)
      const secondScore = secondSeats * 10 + (preferReuse ? secondReuse * 4 : 0)
      return secondScore - firstScore || first.localeCompare(second)
    })
    const wholeGroupCoach = coachNames.find((coach) => remaining[coach].length >= group.length)
    const preferredCoach = wholeGroupCoach || coachNames[0]

    group.forEach((passenger) => {
      let coach = preferredCoach
      if (!remaining[coach]?.length) coach = Object.keys(remaining).find((name) => remaining[name].length)
      const seat = remaining[coach].shift()
      assignments.push({ ...passenger, coach, seat: seat.seat })
      usedCoachCounts[coach] = (usedCoachCounts[coach] || 0) + 1
    })
  }
  return assignments
}

function calculateMetrics(assignments) {
  const coachCounts = assignments.reduce((counts, passenger) => ({ ...counts, [passenger.coach]: (counts[passenger.coach] || 0) + 1 }), {})
  const largestCoachRatio = Math.max(...Object.values(coachCounts)) / assignments.length
  const groups = groupPassengers(assignments)
  const groupScores = groups.map((group) => {
    const coaches = new Set(group.map((passenger) => passenger.coach))
    if (coaches.size > 1) return 0
    const spread = Math.max(...group.map((passenger) => passenger.seat)) - Math.min(...group.map((passenger) => passenger.seat))
    return Math.max(0, 1 - spread / 12)
  })
  const dependentMetric = (type) => {
    const dependents = assignments.filter((passenger) => passenger.type === type)
    if (!dependents.length) return 1
    return average(dependents.map((dependent) => {
      const family = assignments.filter((passenger) => passenger.group === dependent.group && passenger.id !== dependent.id)
      const closest = Math.min(...family.map((member) => seatDistance(dependent, member)))
      return Math.max(0, 1 - closest / 12)
    }))
  }
  const allSeatSpread = Math.max(...assignments.map((passenger) => passenger.seat)) - Math.min(...assignments.map((passenger) => passenger.seat))
  return {
    sameCoach: largestCoachRatio,
    familiesTogether: average(groupScores),
    childrenNearFamily: dependentMetric('Child'),
    seniorsNearFamily: dependentMetric('Senior'),
    closestSeats: Math.max(0, 1 - allSeatSpread / 20),
    coachCounts,
  }
}

export function optimizeSeats({ passengers, preferences, availableSeats }) {
  if (!passengers.length || availableSeats.length < passengers.length) throw new Error('Synthetic seat inventory cannot accommodate this demo group.')
  const assignments = assignSeats(passengers, availableSeats, preferences)
  const metrics = calculateMetrics(assignments)
  const enabledPreferences = ['sameCoach', 'familiesTogether', 'childrenNearFamily', 'seniorsNearFamily'].filter((key) => preferences[key])
  const priorityMetric = preferences.priority === 'same coach'
    ? metrics.sameCoach
    : preferences.priority === 'closest seats'
      ? metrics.closestSeats
      : metrics.familiesTogether
  const weightsTotal = enabledPreferences.reduce((total, key) => total + OPTIMIZER_WEIGHTS[key], 0) + OPTIMIZER_WEIGHTS.selectedPriorityBonus
  const earnedPoints = enabledPreferences.reduce((total, key) => total + metrics[key] * OPTIMIZER_WEIGHTS[key], 0) + priorityMetric * OPTIMIZER_WEIGHTS.selectedPriorityBonus
  const compatibilityScore = Math.round((earnedPoints / weightsTotal) * 100)

  const displayNames = {
    sameCoach: 'Same coach',
    familiesTogether: 'Families together',
    childrenNearFamily: 'Children near family',
    seniorsNearFamily: 'Seniors near family',
  }
  const satisfiedPreferences = enabledPreferences.filter((key) => metrics[key] >= 0.7).map((key) => displayNames[key])
  const unmetPreferences = enabledPreferences.filter((key) => metrics[key] < 0.7).map((key) => displayNames[key])
  const coachesUsed = Object.keys(metrics.coachCounts).length
  const sameCoachStatus = `${Math.max(...Object.values(metrics.coachCounts))} of ${assignments.length} travellers fit in the most-used simulated coach`
  const explanation = unmetPreferences.length
    ? `${sameCoachStatus}. The simulation kept family groups close and minimized the remaining separation; ${unmetPreferences.join(', ')} could not be fully satisfied with the invented seat inventory.`
    : `${sameCoachStatus}. All enabled group preferences were strongly satisfied using the invented seat inventory.`

  return {
    assignments,
    compatibilityScore,
    coachesUsed,
    bookingBatchesRequired: Math.ceil(passengers.length / 6),
    satisfiedPreferences,
    unmetPreferences,
    explanation,
    metrics,
    scoring: { weights: OPTIMIZER_WEIGHTS, enabledPreferences, priority: preferences.priority, priorityMetric },
  }
}
