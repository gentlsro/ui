<script setup lang="ts">
import { ComparatorEnum } from '../.nuxt/generated/comparator-enum'
import NumberInput from './components/Inputs/NumberInput/NumberInput.vue'
import TextInput from './components/Inputs/TextInput/TextInput.vue'
import Selector from './components/Selector/Selector.vue'
import { TableColumn } from './components/Table/models/table-column.model'

const d = ref('2025-01-01')
const dur = ref(2)

const content = ref([
  $t('lorem'),
])

function handleClick() {
  content.value.push($t('lorem'))
}

const x = ref()

// Generatde 100 items
const options = ref<any[]>([])
for (let i = 0; i < 75; i++) {
  options.value.push({
    id: generateUUID(),
    label: `Item ${i}`,
  })
}

const columns = [
  new TableColumn({ field: 'id', label: 'id' }),
  new TableColumn({
    field: 'label',
    label: 'label',
    extraComparators: [ComparatorEnum.IN],
    filterComponent: {
      component: Selector,
      comparators: [ComparatorEnum.EQUAL, ComparatorEnum.IN],
      debounceFilterTriggerMs: 0,
      props: filterItem => {
        const isMulti = filterItem.comparator === ComparatorEnum.IN

        return {
          multi: isMulti,
          options: ['test', 'best', 'rest'],
        }
      },
    },
  }),
]

function getFilterComponent(column: any) {
  if (column.field === 'id') {
    return {
      component: Selector,
      props: {
        options: ['oy', 'vey', 'goy'],
      },
    }
  }
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
      w="300"
    >
      <Table
        :rows="options"
        :columns
        h="300"
        :get-filter-component
      />

      <!-- <div h="100" />

      Value: {{ x }}
      <Selector
        v-model="x"
        :options
        no-sort
      />

      <Btn
        label="add content"
        @click="handleClick"
      />
      <Collapse
        title="Collapse"
        :ui="{ contentClass: () => 'bg-red' }"
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
      a -->
    </div>
  </div>
</template>
