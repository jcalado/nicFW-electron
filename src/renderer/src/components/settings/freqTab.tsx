import { tokens } from '@fluentui/react-components'

export const FreqTab = ({ settings }) => (
  <div
    role="tabpanel"
    aria-labelledby="Conditions"
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      columnGap: '20px',
      rowGap: '20px',
      marginRight: '10px',
      marginTop: '20px',
      boxShadow: tokens.shadow16,
      flex: 1,
      borderRadius: tokens.borderRadiusXLarge,
      backgroundColor: tokens.colorNeutralCardBackground,
      padding: tokens.spacingHorizontalXXL
    }}
  >
    activeVfo, step, rxSplit, txSplit, vfoState, ifFreq, lastFmtFreq, dualWatch, autoFloor
  </div>
)

