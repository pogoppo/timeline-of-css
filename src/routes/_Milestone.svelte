<script lang="ts">
  import type { Fragment } from "./_timeline";
  import MilestoneItem from "./_MilestoneItem.svelte";

  export let fragment: Fragment;

  const displayReleaseDate = (date: Date) => {
    const month = date.toLocaleString("en-US", { month: "2-digit" });
    return `${month}`;
  };
</script>

<section class="Milestone">
  <h3 class="Milestone__release">
    {displayReleaseDate(fragment.releaseDate)}
  </h3>
  <ul class="MilestoneList">
    {#each fragment.items as item}
      <MilestoneItem {item} />
    {/each}
  </ul>
</section>

<style lang="scss">
  @use "src/lib/scss/responsive.scss";
  .Milestone {
    display: flex;
    align-items: flex-start;
    column-gap: 1.5rem;
    max-width: 100vw;
    line-height: 2rem;
    &__release {
      position: relative;
      margin: 0;
      padding: 0 0.5rem 0 2rem;
      background-color: var(--color-milestone);
      color: var(--color-font-reverse);
      font-family: Arial, Helvetica, sans-serif;
      font-size: 1.5rem;
      @include responsive.mq(to-S) {
        padding: 0 0.2rem 0 0.5rem;
      }
      &::after {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        left: 100%;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 1rem 0 1rem 1rem;
        border-color: transparent transparent transparent var(--color-milestone);
      }
    }
  }
  .Milestone:last-child {
    &__release {
      position: relative;
    }
    &__release::after {
      content: "";
      display: block;
      position: absolute;
      top: 100%;
      left: 0;
    }
  }
  .MilestoneList {
    list-style: none;
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    row-gap: 0.25rem;
    position: relative;
    margin: 0;
    padding: 0 1rem;
    background-color: rgba(255, 255, 255, 0.05);
    @include responsive.mq(to-S) {
      padding: 0 0.5rem;
    }
  }
</style>
