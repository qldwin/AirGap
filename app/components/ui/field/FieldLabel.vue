<script setup>
import { cn } from "~/lib/utils";
import { Label } from '@/components/ui/label';

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
</script>

<template>
  <Label
    data-slot="field-label"
    :class="
      cn(
        'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&_>[data-slot=field]]:p-4',
        'has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:border-primary dark:has-[[data-state=checked]]:bg-primary/10',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>
