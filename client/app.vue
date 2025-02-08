<script setup lang="ts">
const d = ref('2025-01-01')
const dur = ref(2)

const content = ref([
  $t('lorem'),
])

function handleClick() {
  content.value.push($t('lorem'))
}
</script>

<template>
  <div
    flex="~ items-start justify-center"
    fit
    p="t-20"
  >
    <div
      flex="~ col"
      w="100"
    >
      <Btn
        label="add content"
        @click="handleClick"
      />
      <Collapse
        title="Collapse"
        :ui="{ contentClass: () => 'bg-red' }"
        :max-content-height="600"
        no-transition
        @before-show="$log('before-show')"
        @hide="$log('hide')"
        @before-hide="$log('before-hide')"
        @show="$log('show')"
      >
        {{ content }}
      </Collapse>
      a

      <div h="100" />

      <Collapse
        title="Collapse ijasdij asidjias jioda iojadio jasiod jioasoijd "
        :ui="{ contentClass: () => 'bg-red' }"
        auto-adjust-height
        floating
      >
        {{ content }}
      </Collapse>
      a
    </div>
  </div>
</template>
