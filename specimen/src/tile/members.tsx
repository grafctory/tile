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
 * Members samples.
 *
 * @module
 */

import { Button } from "@grafctory/clay-widgets/button";
import { Sample } from "@grafctory/specimen/tile-widgets/sample.js";
import { base, Products } from "@grafctory/specimen/toys.js";
import { useCollection } from "@grafctory/tile/collection";
import { type Ordering, useMembers } from "@grafctory/tile/members";
import { text } from "@grafctory/tile/types/text";
import { useState } from "preact/hooks";
import "../tile-widgets/index.css";


const entry = `${base}products/`;

const basis: Ordering = { name: "asc" };


/**
 * Creates the members section.
 *
 * Lists the toy products five at a time, growing on request and sorted either way by name, and restored to the
 * length and order they had as the list is mounted again, as a catalogue is when the reader returns to it.
 *
 * @returns The members section
 */
export function Members() {

	const [order, setOrder] = useState(basis);
	const [limit, setLimit] = useState(5);
	const [mounts, setMounts] = useState(0);

	return <>

		<p>A list bound with <code>useMembers</code> shows the items of a collection a batch at a time, here five,
			retrieving one more batch on request and starting over from the first one as the order changes. The page
			keeps the order and the number of items on show, so a list mounted again grows back to where it was.</p>

		<List key={mounts} order={order} limit={limit}
			onChange={(order, limit) => {
				setOrder(order);
				setLimit(limit);
			}}
			onMount={() => setMounts(mounts+1)}
		/>

	</>;

}


/**
 * Creates the list of toy products.
 *
 * @returns The list, with the controls sorting, growing and mounting it again
 */
function List({

	order,
	limit,

	onChange,
	onMount

}: {

	order: Ordering
	limit: number

	onChange: (order: Ordering, limit: number) => void
	onMount: () => void

}) {

	const collection = useCollection({ entry, shape: Products });

	const members = useMembers(collection, {
		model: { id: {}, sku: {}, label: { "*": {} } },
		basis,
		order,
		limit,
		batch: 5,
		onChange
	});

	return members({

		blank: () => <p>Loading…</p>,

		ready: ({ state, order, sort, reset, load }) => <>

			<div class="controls">
				<Button label="Load more" disabled={!load} onClick={() => load?.()}/>
				<Button label="Reverse" onClick={() => sort({ name: order.name === "desc" ? "asc" : "desc" })}/>
				<Button look="subtle" label="Reset" disabled={!reset} onClick={() => reset?.()}/>
				<Button look="subtle" label="Mount Again" onClick={onMount}/>
			</div>

			<div class="samples">
				<Sample label={`${state.length} items, ${order.name === "desc" ? "decreasing" : "increasing"}`}>
					<ol>{state.map(item => <li key={item.id}><code>{item.sku}</code> {text.write(item.label)}</li>)}</ol>
				</Sample>
			</div>

		</>,

		error: ({ state, reload }) => <div class="controls">
			<span>{state.status} {state.title}</span>
			<Button label="Retry" onClick={() => void reload()}/>
		</div>

	});

}
