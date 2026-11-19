/*
 * Copyright © 2023-2026 Metreeca srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Collection members.
 *
 * Binds a list or a table to the members of a shared collection, so that it retrieves them batch by batch as the
 * reader scrolls through them, rather than the whole collection at once, however long it grows.
 *
 * @module members
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { type Items, items, type Slice } from "@metreeca/blue/value";
import { useModel } from "@metreeca/clay/model";
import { type Lazy, opt, type Optional } from "@metreeca/core";
import { createRelay, type Option, type Relay } from "@metreeca/core/relay";
import { equals, immutable } from "@metreeca/core/values";
import { useEffect, useState } from "preact/hooks";
import type { Problem } from "@metreeca/http/success";
import type { Template } from "@metreeca/qest/model";
import type { Collection, Collections } from "./collection.core.js";
import { useEntry } from "../index.core.js";
import { useStore } from "../index.js";
import { createMembers, type Ordering } from "./members.core.js";

export type { Ordering } from "./members.core.js";


/**
 * Collection members cases.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 * @typeParam T The template or projection stating the values wanted from each item
 */
export type MembersCases<S extends Lazy<ResourceShape>, P extends Collections<S>, T> = {

	/**
	 * The first batch is being retrieved.
	 */
	readonly blank: void

	/**
	 * The members are retrieved; they stay on show while the next ones are on their way.
	 */
	readonly ready: {

		/**
		 * The first items of the collection, narrowed to the values the model asks for.
		 */
		readonly state: Items<S, { readonly [K in P]: T }>

		/**
		 * The sort order the items are shown in, so that a lens marks the expressions they are sorted on.
		 */
		readonly order: Ordering


		/**
		 * Sorts the items again, starting over the first batch.
		 *
		 * @param order The sort order replacing the current one
		 */
		sort(order: Ordering): void

		/**
		 * Sorts the items again in the order the page shows them in by default, starting over the first batch; offered
		 * while they are shown in another order, so that a lens offers a reset control for as long as it is offered.
		 */
		reset?(): void

		/**
		 * Retrieves one more batch; offered while the collection may hold more items, so that a lens closes the
		 * list with a trigger handed `load` for as long as it is offered; a call while a batch is on its way is
		 * ignored, so that a trigger left in view never asks twice for the same batch:
		 *
		 * ```tsx
		 * {members({ ready: ({ load }) => load && <button onClick={() => load()}>More</button> })}
		 * ```
		 */
		load?(): void

	}

	/**
	 * The last retrieval failed.
	 */
	readonly error: {

		/**
		 * The problem describing the failure.
		 */
		readonly state: Problem

		/**
		 * Retrieves the members again.
		 *
		 * @returns A promise resolving once the members are retrieved; rejects with the {@link Problem} describing the
		 *     failure, if the retrieval fails again, the binding then staying in `error` with it
		 */
		reload(): Promise<void>

	}

}


//// !!! ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks an item model against the shape of the collection items.
 *
 * Resolves to `unknown`, which constrains nothing, if the model asks only for values the items hold. Resolves to
 * `never` otherwise, so that a model asking for values the items lack fails to compile.
 */
export type Admitted<S extends Lazy<ResourceShape>, P extends Collections<S>, T> =
	{ readonly [K in P]: T } extends Slice<S, { readonly [K in P]: T }> ? unknown : never


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to the members of a shared collection.
 *
 * Retrieves from the store offered by the innermost enclosing {@link "index"!Store Store} context the first items of
 * the collection, narrowed by the collection criteria, one more batch each time the lens asks for more. The members
 * start over the first batch, and again whenever the collection criteria, the model or the batch size change. The
 * model is compared by content, so it may be written inline, and so may the sort orders.
 *
 * Every batch on show is retrieved again as the store signals a change, so that no item on show goes stale.
 *
 * A page restoring a catalogue the reader returns to keeps the sort order and the number of items on show wherever it
 * likes, handing them back as the members bind, so that the catalogue grows back to where the reader left it:
 *
 * ```tsx
 * const [order, setOrder] = useState<Ordering>({ startDate: "asc" }); // or wherever the page keeps them
 * const [limit, setLimit] = useState(100);
 *
 * const members = useMembers(collection, {
 *     model, basis: { startDate: "asc" }, order, limit,
 *     onChange: (order, limit) => { setOrder(order); setLimit(limit); }
 * });
 * ```
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 * @typeParam T The template or projection stating the values wanted from each item
 *
 * @param collection The collection whose members are retrieved
 * @param options The values wanted from each item, the sort orders the items start in and return to, the number of
 *     items they start over, the size of each batch, and the handler taking the order and number as they change
 *
 * @returns A {@link Relay} over the {@link MembersCases} of the binding
 *
 * @throws {@link !Error Error} If called outside any {@link "index"!Store Store} context
 * @throws {@link !TypeError TypeError} If `limit` or `batch` isn't a positive integer
 */
export function useMembers<
	S extends Lazy<ResourceShape>,
	P extends Collections<S>,
	T extends object
>(collection: Collection<S, P>, {

	model,

	basis,
	order,

	limit,
	batch,

	onChange

}: {

	/**
	 * The template or projection stating the values wanted from each item, checked against the item shape so
	 * that a model asking for values the items lack fails to compile: `{ label: {} }` lists the item labels.
	 */
	readonly model: T & Admitted<S, P, T>


	/**
	 * The sort order the page shows the items in by default, which `reset` restores, as expressions mapped to their
	 * direction: `{ label: "asc" }`. A page restoring the sort order of the reader states it too, otherwise `reset`
	 * restores the order of the reader rather than the one the page shows the items in by default.
	 *
	 * @defaultValue `order`
	 */
	readonly basis?: Ordering

	/**
	 * The sort order the items start in. It is read again only as the members start over, so a page handing back the
	 * order `onChange` takes doesn't retrieve the items twice. A page sorting the items again from outside the lens
	 * calls the `sort` function the members hand over, which takes effect immediately.
	 */
	readonly order?: Ordering


	/**
	 * The number of items the members start over, rounded up to whole batches. It is read only as the members bind,
	 * so members starting over for new criteria, a new model or a new batch size start over a single batch.
	 *
	 * @defaultValue `batch`
	 */
	readonly limit?: number

	/**
	 * The number of items in each batch. Each batch is retrieved by a request of its own, so a batch size within
	 * the server cap on response size lets a long collection be read in full, however many items it holds.
	 *
	 * @defaultValue 100
	 */
	readonly batch?: number


	/**
	 * Takes the sort order the items are shown in and the number of items requested from the start of the collection,
	 * once for every change to either, so that a page may keep them wherever it likes. Changes come as the items are
	 * sorted, a batch is loaded or the members start over. The order and number the members bind with are never
	 * handed back, since the page handed them over itself and already keeps them where it took them from.
	 */
	readonly onChange?: (order: Ordering, limit: number) => void

}): Relay<MembersCases<S, P, T>> {

	const store = useStore();

	const { target: { entry, shape, field }, scope, query: criteria } = collection;

	const dependencies = [entry, field, scope, criteria, model, batch];

	// the dependencies of the first render alone, so that only the members created as the hook binds take the limit

	const [bound] = useState(() => dependencies);

	const members = useModel(() => createMembers({
		order,
		limit: dependencies === bound ? limit : undefined,
		batch
	}), dependencies);

	// the order and limit last handed over, first those the members start with, so that only changes reach onChange

	const shown = { order: members.order, limit: members.limit };

	const [notified, setNotified] = useState(shown);

	useEffect(() => {

		if ( !equals(notified, shown) ) {
			setNotified(shown);
			onChange?.(shown.order, shown.limit);
		}

	}, [members.order, members.limit]);

	const $basis = basis ?? order ?? {};

	const holder: Lazy<ResourceShape> = shape; // the generic shape accepts any model: the items are typed by the
											   // signature

	const query = { ...model, ...criteria, ...scope, ...ranks(members.order) };
	const source = { entry, field, query }; // the collection the items on show are drawn from

	const binding = createRelay(useEntry<Batch, { readonly source: typeof source, readonly limit: number }>({

		store,
		entry,
		model: { [field]: { ...query, "#": members.limit } }, // the items on show, retrieved again as they change

		lookup: shown => shown && equals(shown.source, source) && shown.limit === members.limit-members.batch
			? page(shown.limit).then(items => opt(items, items => [...shown.state, ...items]))
			: pages(members.limit),

		modify: () => ({ source, limit: members.limit }) // what this render asks for, as the items it retrieves answer
														// it

	}));

	return createRelay(binding<Option<MembersCases<S, P, T>>>({

		blank: () => ({ blank: undefined }),

		ready: ({ state, limit }) => immutable({
			ready: {

				state: state as Items<S, { readonly [K in P]: T }>, // ;(cast) retrieved under the model typing T
				order: members.order,

				...(state.length < limit ? {} : {
					load: () => limit === members.limit ? void members.load() : undefined
				}),
				...(equals(members.order, $basis) ? {} : {
					reset: () => void members.sort($basis)
				}),
				sort: (order: Ordering) => void members.sort(order)

			}
		}),

		error: error => ({ error })

	}));


	/**
	 * Retrieves the batches up to a limit, each by a request of its own.
	 *
	 * @param limit The number of first items retrieved, a multiple of the batch size
	 */
	function pages(limit: number): Promise<Optional<Batch>> {
		return Promise.all(Array.from({ length: limit/members.batch }, (_, index) => page(index*members.batch)))
			.then(pages => pages.every(page => page !== undefined) ? pages.flat() : undefined);
	}

	/**
	 * Retrieves the batch starting at an offset.
	 *
	 * @param offset The number of first items skipped
	 */
	function page(offset: number): Promise<Optional<Batch>> {

		const slice: Template = { [field]: { ...query, "@": offset, "#": members.batch } };

		return store.lookup({ entry, shape: holder, model: slice })
			.then(match => opt(match, match => items(match, slice)));

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Collection items retrieved under the generic shape, typed by the {@link useMembers} signature.
 */
type Batch = Items<Lazy<ResourceShape>, Template>


/**
 * States a sort order as collection criteria.
 *
 * @param order The expressions mapped to their direction
 *
 * @returns The `^` criteria stating `order`
 */
function ranks(order: Ordering): object {
	return Object.fromEntries(Object.entries(order).map(([expression, direction]) => [`^${expression}`, direction]));
}
