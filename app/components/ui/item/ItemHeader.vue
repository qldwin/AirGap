<script setup>
import { cn } from "@/lib/utils";

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
</script>

<template>
  <div
    data-slot="item-header"
    :class="
      cn('flex basis-full items-center justify-between gap-2', props.class)
    "
  >
    <slot />
  </div>
</template>
