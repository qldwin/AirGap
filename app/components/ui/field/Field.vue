<script setup>
import { cn } from "~/lib/utils";
import { fieldVariants } from ".";

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
  orientation: { type: null, required: false },
});
</script>

<template>
  <fieldset
      data-slot="field"
      :data-orientation="orientation"
      :class="cn(
      fieldVariants({ orientation }),
      'border-0 p-0 m-0 min-w-0',
      props.class
    )"
  >
    <slot />
  </fieldset>
</template>