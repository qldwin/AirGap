<script setup>
import { reactiveOmit } from "@vueuse/core";
import { CalendarHeadCell, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <CalendarHeadCell
    :class="
      cn(
        'w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground',
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarHeadCell>
</template>
