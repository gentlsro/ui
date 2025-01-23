<script setup lang="ts">
// Functions
import { useTableAutoFit } from './composables/useTableAutoFit'

// Utils
const { fitColumns } = useTableAutoFit()
</script>

<template>
  <Btn
    size="sm"
    no-uppercase
    icon="i-material-symbols:fit-width"
    p="!x-2"
    color="ca"
    @click="fitColumns"
  >
    <!-- Label -->
    <div class="items-center hidden lg:flex gap-1">
      <span text="xs">
        {{ $t('table.fitColumns') }}
      </span>
    </div>

    <Tooltip
      flex="~ col gap-1"
      p="2"
      :delay="[1500, 0]"
    >
      <div
        text="caption"
        flex="~ gap-1"
      >
        <KeyboardShortcut
          icon="i-hugeicons:mouse-left-click-01"
          with-ctrl
          force-visibility
          shrink-0
        />

        {{ $t('table.justifyColumns') }}
      </div>

      <div
        text="caption"
        flex="~ gap-1"
      >
        <KeyboardShortcut
          icon="i-hugeicons:mouse-left-click-01"
          with-shift
          force-visibility
          shrink-0
        />

        {{ $t('table.stretchColumns') }}
      </div>
    </Tooltip>
  </Btn>
</template>
