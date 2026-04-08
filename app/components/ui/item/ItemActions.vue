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
    data-slot="item-actions"
    :class="cn('flex items-center gap-2', props.class)"
  >
    <slot />
  </div>
</template>
