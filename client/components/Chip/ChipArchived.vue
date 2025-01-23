<script setup lang="ts">
// Constants
import { BUTTON_PRESET } from '../Button/constants/button-preset.constant'

type IProps = {
  absolute?: boolean
}

defineProps<IProps>()
</script>

<template>
  <Chip
    :icon="BUTTON_PRESET.ARCHIVE.icon"
    bg="dark-50"
    color="true-gray-400"
    :label="$t('general.archived')"
    h-8
    :class="{ 'absolute!': absolute }"
  />
</template>
