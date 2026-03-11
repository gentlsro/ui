<script setup lang="ts">
import { TableColumn } from './components/Table/models/table-column.model';
import type { ITableFetchPayload } from './components/Table/types/table-fetch-payload.type';


const rows = ref<Array<{ id: string, name: string }>>()

const columns = [
  new TableColumn({ field: 'id' })
]

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getData(payload: ITableFetchPayload) {
  await wait(1000);

  const data = generateData(25);

  if (payload.fetchMore) {
    return {
      data,
      count: 200
    }
  }

  return {
    data,
    count: 200
  }
}

function generateData(length: number) {
  return Array.from({ length }, (_, i) => ({ id: i + new Date().getTime(), name: `Name ${i}` }));
}
</script>

<template>
  <div class="flex flex-col w-500 h-100vh" overflow="auto">
    <Table
      :columns
      :load-data="{ fnc: getData }"
    />
  </div>  
</template>
