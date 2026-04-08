<script setup>
import { cn } from "@/lib/utils";
import { Separator } from '@/components/ui/separator';

const props = defineProps({
  orientation: { type: String, required: false },
  decorative: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
</script>

<template>
  <Separator
    data-slot="item-separator"
    orientation="horizontal"
    :class="cn('my-0', props.class)"
  />
</template>
