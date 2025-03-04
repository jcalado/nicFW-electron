import { ChannelGroups } from '../main/types/channel'

/**
 * Shifts all defined groups to the first available slots
 * Example: {g0: 0, g1: 2, g2: 0, g3: 3} becomes {g0: 2, g1: 3, g2: 0, g3: 0}
 */
export function compactGroups(groups: ChannelGroups): ChannelGroups {
  // Extract non-zero group values
  const definedGroups = [groups.g0, groups.g1, groups.g2, groups.g3].filter(g => g !== 0)

  // Create new compacted groups object
  const compacted: ChannelGroups = {
    g0: 0,
    g1: 0,
    g2: 0,
    g3: 0
  }

  // Assign defined groups to first available slots
  definedGroups.forEach((group, index) => {
    compacted[`g${index}` as keyof ChannelGroups] = group
  })

  return compacted
}
