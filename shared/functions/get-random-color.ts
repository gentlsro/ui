import { useSemiRandom } from '$utils'

// Functions
import { useColors } from '../composables/useColors'

// Constants
import { COLORS_PREDEFINED } from '../constants/colors-predefined.constant'

const { semiRandomPick } = useSemiRandom()
const { getColor } = useColors()

export function getRandomColor(seed?: string, colors?: string[]) {
  return getColor(semiRandomPick(colors ?? COLORS_PREDEFINED, seed ?? ''), undefined, true)
}
