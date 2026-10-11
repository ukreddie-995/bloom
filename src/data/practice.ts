export type BubbleStep = {
  values: number[]
  left: number
  right: number
  swapped: boolean
  sortedFrom: number
  codeLine: number
  description: string
}

export type LinkedListStep = {
  reversed: number[]
  remaining: number[]
  current: number | null
  previous: number | null
  codeLine: number
  description: string
}

export function createBubbleSortSteps(input: number[]): BubbleStep[] {
  const values = [...input]
  const steps: BubbleStep[] = [{
    values: [...values], left: -1, right: -1, swapped: false, sortedFrom: values.length,
    codeLine: 0, description: 'Start with the values in their original order.',
  }]
  for (let end = values.length - 1; end > 0; end -= 1) {
    for (let index = 0; index < end; index += 1) {
      const shouldSwap = values[index] > values[index + 1]
      if (shouldSwap) [values[index], values[index + 1]] = [values[index + 1], values[index]]
      steps.push({
        values: [...values],
        left: index,
        right: index + 1,
        swapped: shouldSwap,
        sortedFrom: index === end - 1 ? end : end + 1,
        codeLine: shouldSwap ? 4 : 3,
        description: shouldSwap
          ? `${values[index + 1]} is greater than ${values[index]}, so swap them. The larger value moves right.`
          : `${values[index]} is already smaller than ${values[index + 1]}, so leave this pair in place.`,
      })
    }
  }
  steps.push({
    values: [...values], left: -1, right: -1, swapped: false, sortedFrom: 0,
    codeLine: 7, description: 'Every adjacent pair is in order. The list is sorted!',
  })
  return steps
}

export function createLinkedListSteps(input: number[]): LinkedListStep[] {
  const steps: LinkedListStep[] = [{
    reversed: [],
    remaining: [...input],
    current: input[0] ?? null,
    previous: null,
    codeLine: 1,
    description: 'Start at the head. Keep a previous pointer so each next link can be flipped safely.',
  }]
  const reversed: number[] = []
  input.forEach((value, index) => {
    const next = input[index + 1] ?? null
    reversed.unshift(value)
    steps.push({
      reversed: [...reversed],
      remaining: input.slice(index + 1),
      current: next,
      previous: value,
      codeLine: 5,
      description: next === null
        ? `Point ${value}.next back to ${reversed[1] ?? 'null'}. The old tail is now the new head.`
        : `Save next (${next}), then point ${value}.next back to ${reversed[1] ?? 'null'}. Advance to ${next}.`,
    })
  })
  return steps
}
