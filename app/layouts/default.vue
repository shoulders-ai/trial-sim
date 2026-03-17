<template>
  <div class="min-h-screen bg-white flex flex-col">
    <LayoutSiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutSiteFooter />
  </div>
</template>
