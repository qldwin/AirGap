<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({
  hideLabel: { type: Boolean, required: false },
  hideIndicator: { type: Boolean, required: false },
  indicator: { type: String, required: false, default: "dot" },
  nameKey: { type: String, required: false },
  labelKey: { type: String, required: false },
  labelFormatter: { type: Function, required: false },
  payload: { type: Object, required: false, default: () => ({}) },
  config: { type: null, required: false, default: () => ({}) },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
  color: { type: String, required: false },
  x: { type: [Number, Date], required: false },
});

const payload = computed(() => {
  return Object.entries(props.payload)
    .map(([key, value]) => {
      const itemConfig = props.config[key];
      const indicatorColor = props.config[key]?.color ?? props.payload.fill;

      return { key, value, itemConfig, indicatorColor };
    })
      .filter((i) => i.itemConfig && i.value !== 0);
});

const nestLabel = computed(
  () => Object.keys(props.payload).length === 1 && props.indicator !== "dot",
);
const tooltipLabel = computed(() => {
  if (props.hideLabel) return null;
  if (props.labelFormatter && props.x !== undefined) {
    return props.labelFormatter(props.x);
  }
  return props.labelKey
    ? props.config[props.labelKey]?.label || props.payload[props.labelKey]
    : props.x;
});
</script>

<template>
  <div
    :class="
      cn(
        'backdrop-blur-md bg-white/40 dark:bg-neutral-900/40 grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl',
        props.class,
      )
    "
  >
    <slot>
      <div v-if="!nestLabel && tooltipLabel" class="font-medium">
        {{ tooltipLabel }}
      </div>
      <div class="grid gap-1.5">
        <div
          v-for="{ value, itemConfig, indicatorColor, key } in payload"
          :key="key"
          :class="
            cn(
              '[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
              indicator === 'dot' && 'items-center',
            )
          "
        >
          <component :is="itemConfig.icon" v-if="itemConfig?.icon" />
          <template v-else-if="!hideIndicator">
            <div
              :class="
                cn(
                  'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
                  {
                    'h-2.5 w-2.5': indicator === 'dot',
                    'w-1': indicator === 'line',
                    'w-0 border-[1.5px] border-dashed bg-transparent':
                      indicator === 'dashed',
                    'my-0.5': nestLabel && indicator === 'dashed',
                  },
                )
              "
              :style="{
                '--color-bg': indicatorColor,
                '--color-border': indicatorColor,
              }"
            />
          </template>

          <div
            :class="
              cn(
                'flex flex-1 justify-between gap-5 leading-none',
                nestLabel ? 'items-end' : 'items-center',
              )
            "
          >
            <div class="grid gap-1.5">
              <div v-if="nestLabel" class="font-medium">
                {{ tooltipLabel }}
              </div>
              <span class="text-muted-foreground">
                {{ itemConfig?.label || value }}
              </span>
            </div>
            <span
              v-if="value"
              class="text-foreground font-mono font-medium tabular-nums"
            >
              {{ value.toLocaleString() }}€
            </span>
          </div>
        </div>
      </div>
    </slot>
  </div>
</template>
