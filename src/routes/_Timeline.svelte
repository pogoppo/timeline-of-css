<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";

  import type CSS from "$lib/repositories/css";
  import { createTimeline, type Timeline } from "./_timeline";
  import Milestone from "./_Milestone.svelte";

  export let items: CSS;
  let history: Timeline;
  let historyGradient: Function;
  const historyGradientFrom: [number, number, number] = [255, 54, 71];
  const historyGradientTo: [number, number, number] = [255, 244, 79];
  const activatedDetails = writable<HTMLElement | null>();

  setContext("CSS", items);
  setContext("activatedDetails", activatedDetails);

  function* createGradient(
    rgb1: [number, number, number],
    rgb2: [number, number, number],
    split: number
  ) {
    for (let d = 1; d > 0; d = d - 1 / split) {
      const r = (rgb1[0] - rgb2[0]) * d + rgb2[0];
      const g = (rgb1[1] - rgb2[1]) * d + rgb2[1];
      const b = (rgb1[2] - rgb2[2]) * d + rgb2[2];
      yield [r, g, b].map(Math.floor);
    }
  }

  onMount(async () => {
    history = createTimeline(items);
    const historyPathGradient = createGradient(
      historyGradientFrom,
      historyGradientTo,
      history.length
    );
    historyGradient = () => {
      const rgb = historyPathGradient.next().value?.join(",");
      return `rgb(${rgb})`;
    };

    window.addEventListener("click", (event) => {
      if ($activatedDetails) {
        const target = event.target as HTMLElement;
        if (!$activatedDetails.contains(target)) {
          activatedDetails.set(null);
        }
      }
    });
  });
</script>

<anchor-point id="history" />
<article class="Timeline">
  {#if history}
    {#each history as milestone}
      {@const colorMilestone = historyGradient()}
      <section
        id={String(milestone.year)}
        class="Timeline__section"
        style:--color-milestone={colorMilestone}
      >
        <h2 class="Timeline__title">
          <a href={`#${milestone.year}`}>{milestone.year}</a>
        </h2>
        <collapsable-area>
          {#each milestone.fragments as fragment}
            <Milestone {fragment} --color-milestone={colorMilestone} />
          {/each}
        </collapsable-area>
      </section>
    {/each}
  {/if}
</article>

<style lang="scss">
  @use "src/lib/scss/responsive.scss";
  .Timeline {
    position: relative;
    min-width: fit-content;
    background-color: var(--color-bg-contents);
    border-left: 2rem solid var(--color-milestone);
    &__section {
      display: flex;
      flex-direction: column;
      row-gap: 2rem;
      position: relative;
      padding-bottom: 4rem;
    }
    &__title {
      position: sticky;
      top: 0;
      z-index: 4;
      margin: 0;
      padding: 0 2rem;
      background-color: var(--color-milestone);
      color: var(--color-font-reverse);
      font-family: var(--font-family-accent-sans);
      font-size: 4rem;
      font-weight: 900;
      @include responsive.mq(to-S) {
        padding: 0 0.75rem;
        font-size: 3.5rem;
      }
      > a {
        color: inherit;
      }
      > a:hover::after {
        content: "#";
        margin-left: 0.1em;
        font-family: monospace;
        opacity: 0.5;
      }
    }
  }
  collapsable-area {
    display: contents;
  }
  .Timeline {
    #history:target ~ & &__section {
      row-gap: 0;
      padding: 0;
    }
    #history:target ~ & &__title {
      > a {
        display: block;
      }
    }
    #history:target ~ & &__title ~ collapsable-area {
      display: none;
    }
  }
</style>
