<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type CSS from "$lib/repositories/css";
  import type { Item } from "$lib/repositories/css";

  export let item: Item;
  const items = getContext<CSS>("CSS");
  const activatedDetails =
    getContext<Writable<HTMLElement>>("activatedDetails");
  let detailsElement: HTMLElement;
  let parentItem: Item;

  const showDetails = (parentName: string) => {
    parentItem ||= items.parent(parentName) as Item;
    activatedDetails.set(detailsElement);
  };
</script>

<li class="MilestoneItem" data-category={item.category}>
  <aside
    class="MilestoneItem__details"
    class:--active={$activatedDetails === detailsElement}
    bind:this={detailsElement}
  >
    <h4>
      <i class="MilestoneItem__category-label" data-category={item.category} />
      {#if item.parent == item.name}
        <span class="MilestoneItem__name">{item.name}</span>
      {:else}
        <span class="MilestoneItem__name">{item.parent}</span>
        <span class="MilestoneItem__name --small">{item.name}</span>
      {/if}
    </h4>
    <p>
      Release: {new Date(item.releaseDate).toLocaleDateString()} (v{item.version})
    </p>
    {#if item.parent != item.name && item.description}
      <p>{@html item.description}</p>
    {/if}
    {#if item.link}
      <p><a href={item.link} target="_blank" rel="noopener">{item.link}</a></p>
    {/if}

    {#if item.parent != item.name && parentItem}
      <h5>Related</h5>
      <h4>
        <i
          class="MilestoneItem__category-label"
          data-category={parentItem.category}
        />
        {parentItem.name}
      </h4>
      {#if parentItem.link}
        <p>
          <a href={parentItem.link} target="_blank" rel="noopener"
            >{parentItem.link}</a
          >
        </p>
      {/if}
    {/if}
  </aside>

  <i class="MilestoneItem__category-label" data-category={item.category}></i>
  <button
    class="MilestoneItem__button"
    on:click|stopPropagation={() => showDetails(item.parent)}
  >
    {#if item.parent == item.name}
      <span class="MilestoneItem__name">{item.name}</span>
    {:else}
      <span class="MilestoneItem__name">{item.parent}</span>
      <span class="MilestoneItem__name --small">{item.name}</span>
    {/if}
  </button>
</li>

<style lang="scss">
  @use "src/lib/scss/responsive.scss";
  .MilestoneItem {
    display: flex;
    align-items: center;
    column-gap: 4px;
    color: var(--color-font-link);
    &__category-label::before {
      display: none;
      padding: 2px 4px;
      border: 1px solid var(--color-label-accent);
      border-radius: 4px;
      color: var(--color-label-accent);
      font-size: 0.75rem;
      font-style: normal;
      line-height: 1.2;
      text-align: center;
    }
    &__category-label[data-category="properties"]::before {
      content: "Property";
    }
    &__category-label[data-category="at-rules"]::before {
      display: inline-block;
      content: "@";
    }
    &__category-label[data-category="selectors"]::before {
      display: inline-block;
      content: ":Selector";
    }
    &__category-label[data-category="types"]::before {
      display: inline-block;
      content: "<Type>";
    }
    &__details &__category-label[data-category="properties"]::before {
      display: inline-block;
    }

    &__button {
      all: unset;
      display: flex;
      align-items: center;
      column-gap: 4px;
      border-bottom: 1px dashed var(--color-font-link);
      cursor: pointer;
      &:hover {
        color: var(--color-font-default);
        border-color: var(--color-font-default);
      }
    }
    &__name {
      &.--small {
        font-size: 0.8em;
        word-break: break-all;
        line-height: 1;
        opacity: 0.7;
      }
    }
    &__details {
      position: absolute;
      left: 50%;
      z-index: 9;
      translate: -50% calc(50% + 2rem);
      width: calc(100% - 2rem);
      padding: 0.75rem 1rem;
      background-color: #282828;
      border: 4px solid rgba(255, 255, 255, 0.3);
      box-sizing: border-box;
      color: var(--color-font-default);
      &:not(.--active) {
        display: none;
      }
      > h4 {
        margin: 0;
      }
      > h5 {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        column-gap: 16px;
        margin: 24px 0 8px;
        font-size: 1.25em;
        opacity: 0.7;
        &::after {
          content: "";
          display: block;
          width: 100%;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.5);
        }
      }
      > p {
        margin: 8px 0;
        line-height: 1.5;
        > :global(code) {
          display: inline-block;
          padding: 0 8px;
          background-color: #111;
        }
        > a {
          word-break: break-all;
        }
      }
    }
    &__details.--active ~ &__button {
      color: var(--color-font-default);
      border-bottom-style: solid;
      border-color: var(--color-font-default);
    }
  }
</style>
