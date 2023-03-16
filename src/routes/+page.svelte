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
  {:else}
    <div class="centering" />
  {/if}
</main>

<style lang="scss">
  @keyframes loading {
    0% {
      content: "   ";
    }
    25% {
      content: ".  ";
    }
    50% {
      content: ".. ";
    }
    75% {
      content: "...";
    }
  }
  main {
    max-width: var(--contents-base-width);
    margin: 0 auto;
  }
  .centering {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    &::before {
      content: "   ";
      display: block;
      animation: 2s linear 0s infinite normal loading;
      white-space: pre-wrap;
      font-size: 48px;
      font-family: "Courier New", Courier, monospace;
    }
  }
</style>
