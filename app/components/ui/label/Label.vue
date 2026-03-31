<script setup>
import { reactiveOmit } from "@vueuse/core";
import { Label } from "reka-ui";
import { cn } from "~/lib/utils";

const props = defineProps({
  for: { type: String, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
  label: { type: String, required: false }
});

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <Label
      v-bind="delegatedProps"
      :for="props.for"
      :class="cn('...', props.class)"
  >
    <span v-if="props.label">{{ props.label }}</span>
    <span v-else><slot /></span>
  </Label>
</template>
