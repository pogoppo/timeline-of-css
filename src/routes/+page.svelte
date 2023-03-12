<script lang="ts">
  import { onMount } from "svelte";

  import CSS from "$lib/repositories/css";
  import { createDatabase } from "$lib/db/sqlite";
  import Timeline from "./_Timeline.svelte";
  import TimelineHeader from "./_TimelineHeader.svelte";

  let items: CSS;
  let lastUpdate: Date;

  onMount(async () => {
    const db = await createDatabase("/css.sqlite");
    items = new CSS(db);
    lastUpdate = items.lastUpdate();
  });
</script>

<svelte:head>
  <title>Timeline of CSS</title>
  <meta name="description" content="Timeline of CSS properties." />
</svelte:head>

<TimelineHeader {lastUpdate} />

<main>
  {#if items}
    <Timeline {items} />
  {/if}
</main>

<style lang="scss">
  main {
    max-width: var(--contents-base-width);
    margin: 0 auto;
  }
</style>
