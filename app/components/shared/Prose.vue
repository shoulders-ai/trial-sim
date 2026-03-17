<template>
  <div class="max-w-3xl prose-sim">
    <slot />
  </div>
</template>

<style scoped>
.prose-sim :deep(h1) {
  @apply text-3xl md:text-4xl font-serif font-semibold tracking-tight text-stone-900 mb-4;
}
.prose-sim :deep(h2) {
  @apply text-2xl font-serif font-semibold tracking-tight text-stone-900 mb-3;
}
.prose-sim :deep(h3) {
  @apply text-xl font-serif font-semibold tracking-tight text-stone-900 mb-2;
}
.prose-sim :deep(p) {
  @apply text-base text-stone-600 leading-relaxed mb-4;
}
.prose-sim :deep(a) {
  @apply text-stone-900 underline underline-offset-2 hover:text-cadet-500 transition-colors;
}
</style>
