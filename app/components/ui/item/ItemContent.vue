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
    data-slot="item-content"
    :class="
      cn(
        'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
