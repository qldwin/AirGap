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
    data-slot="item-title"
    :class="
      cn(
        'flex w-fit items-center gap-2 text-sm leading-snug font-medium',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
