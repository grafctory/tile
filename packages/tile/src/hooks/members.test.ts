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

import { reference } from "@grafctory/blue/reference";
import { id, multiple, required, resource } from "@grafctory/blue/resource";
import { string } from "@grafctory/blue/string";
import { immutable } from "@grafctory/core/values";
import type { Store as Backend } from "@grafctory/keep";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Collection } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { Store } from "../index.js";
import { createMembers } from "./members.core.js";
import { type Ordering, useMembers } from "./members.js";


const batch = 10;


describe("createMembers()", () => {

	const members = () => createMembers({ order: { label: "asc" }, batch });


	describe("creation", () => {

		it("should start over the first batch", async () => {
			expect(members().limit).toBe(batch);
		});

		it("should retrieve the items in batches of the given size", async () => {
			expect(members().load().batch).toBe(batch);
		});

		it("should retrieve 100 items per batch by default", async () => {
			expect(createMembers().batch).toBe(100);
		});

		it("should sort the items as given", async () => {
			expect(members().order).toEqual({ label: "asc" });
		});

		it("should start unsorted by default", async () => {
			expect(createMembers().order).toEqual({});
		});

		it.each([0, -1, 1.5])("should reject a batch size of %s", async batch => {
			expect(() => createMembers({ batch })).toThrow(TypeError);
		});

		it("should start over the given number of items", async () => {
			expect(createMembers({ limit: 2*batch, batch }).limit).toBe(2*batch);
		});

		it("should round the given number of items up to whole batches", async () => {
			expect(createMembers({ limit: batch+1, batch }).limit).toBe(2*batch);
		});

		it.each([0, -1, 1.5])("should reject a limit of %s", async limit => {
			expect(() => createMembers({ limit, batch })).toThrow(TypeError);
		});

	});

	describe("load()", () => {

		it("should retrieve one more batch", async () => {
			expect(members().load().load().limit).toBe(3*batch);
		});

	});

	describe("sort()", () => {

		it("should restart from the first batch in the new order", async () => {

			const sorted = members().load().sort({ label: "desc" });

			expect(sorted.order).toEqual({ label: "desc" });
			expect(sorted.limit).toBe(batch);

		});

		it("should replace the sort order rather than merge into it", async () => {
			expect(members().sort({ id: 1 }).order).toEqual({ id: 1 });
		});

		it("should leave the members as they stand where the order is unchanged", async () => {

			const initial = members().load();

			expect(initial.sort({ label: "asc" })).toBe(initial);

		});

	});

});


describe("useMembers()", () => {

	const entry = "https://example.com/catalogue/";

	const Item = resource({ id: id(), label: required(string()) });
	const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

	type Binding = ReturnType<typeof useMembers<typeof Catalogue, "members", { readonly label: {} }>>;


	function backend(lookup: unknown, observers: Set<() => void> = new Set()): Backend {
		return {
			lookup,
			observe: (observer: () => void) => {
				observers.add(observer);
				return () => observers.delete(observer);
			}
		} as unknown as Backend; // ;(test stub) only the members called
	}

	function items(size: number) {
		return Array.from({ length: size }, (_, index) => ({ id: `${entry}${index}`, label: `item ${index}` }));
	}

	/**
	 * A store holding as many items as given, handing out the page the model offset and limit ask for.
	 */
	function catalogue(size: number = batch/2) {
		return vi.fn(async ({ model }: { model: { members: { "@": number, "#": number } } }) => immutable({
			id: entry,
			members: items(size).slice(model.members["@"], model.members["@"]+model.members["#"])
		}));
	}

	/**
	 * The members options a test hands over beside those every test shares.
	 */
	type Options = {

		readonly basis?: Ordering
		readonly order?: Ordering
		readonly limit?: number

		readonly onChange?: (order: Ordering, limit: number) => void

	}

	function mount(lookup: unknown, criteria = {}, scope = {}, options: Options = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		members: () => Binding

		update(options: Options): void
		signal(): void

	} {

		const observers = new Set<() => void>();

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const bindings = vi.fn<(members: Binding) => void>();

		const factory = () => backend(lookup, observers);

		function Probe(options: Options) {

			const collection = useCollection({ entry, shape: Catalogue, scope, query: criteria });

			collections(collection);

			bindings(useMembers(collection, {
				model: { label: {} },
				order: { label: "asc" },
				batch,
				...options
			}));

			return null;

		}

		function show(options: Options) {
			act(() => render(createElement(Store, { factory, children: createElement(Probe, options) }), document.body));
		}

		show(options);

		return {
			collection: () => collections.mock.lastCall![0], // test harness: Probe has rendered at least once
			members: () => bindings.mock.lastCall![0],
			update: show,
			signal: () => act(() => observers.forEach(observer => observer()))
		};
	}

	function models(lookup: ReturnType<typeof catalogue>) {
		return lookup.mock.calls.map(([{ model }]) => model);
	}

	function load(members: Binding) {
		return members({ ready: ({ load }) => load });
	}

	function reset(members: Binding) {
		return members({ ready: ({ reset }) => reset });
	}


	afterEach(async () => {
		act(() => render(null, document.body));
	});


	it("should retrieve the members narrowed by the collection, arranged by the view", async () => {

		const lookup = catalogue();
		const { collection } = mount(lookup, { "?university": ["u1"] });

		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(models(lookup)).toContainEqual({
			members: {
				label: {},
				"?university": ["u1"], "~label": "item",
				"^label": "asc",
				"@": 0,
				"#": batch
			}
		}));

	});

	it("should retrieve only the members the collection scope lets through", async () => {

		const lookup = catalogue();

		mount(lookup, { "~label": "item" }, { "?university": ["u1"] });

		await vi.waitFor(() => expect(models(lookup)).toContainEqual({
			members: {
				label: {},
				"~label": "item", "?university": ["u1"],
				"^label": "asc",
				"@": 0,
				"#": batch
			}
		}));

	});

	it("should throw outside a store context", async () => {

		function Probe() {

			useMembers(useCollection({ entry, shape: Catalogue }), { model: { label: {} } });

			return null;

		}

		expect(() => act(() => render(createElement(Probe, {}), document.body))).toThrow("missing <Store> context");

	});

	it("should be blank until the first batch is retrieved", async () => {

		const { members } = mount(vi.fn(() => new Promise(() => {})));

		expect(members()({ blank: "blank" })).toBe("blank");

	});

	it("should move to error on a failed retrieval, retrieving the members again on reload", async () => {

		const lookup = vi.fn().mockRejectedValueOnce({ status: 503 }).mockImplementation(catalogue());
		const { members } = mount(lookup);

		await vi.waitFor(() => expect(members()({ error: ({ state }) => state.status })).toBe(503));

		await act(() => members()({ error: ({ reload }) => reload() }));

		await vi.waitFor(() => expect(members()({ ready: ({ state }) => state })).toEqual(items(batch/2)));

	});

	it("should retrieve the members again as the store signals a change", async () => {

		const lookup = catalogue();
		const { members, signal } = mount(lookup);

		await vi.waitFor(() => expect(members()({ ready: () => true })).toBe(true));

		const calls = lookup.mock.calls.length;

		signal();

		await vi.waitFor(() => expect(lookup.mock.calls.length).toBeGreaterThan(calls));

	});

	it("should retrieve again every batch on show as the store signals a change", async () => {

		const lookup = catalogue(3*batch);
		const { members, signal } = mount(lookup);

		await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		act(() => load(members())!());

		await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(2*batch));

		const calls = lookup.mock.calls.length;

		signal();

		await vi.waitFor(() => expect(models(lookup).slice(calls)).toEqual([
			{ members: expect.objectContaining({ "@": 0, "#": batch }) },
			{ members: expect.objectContaining({ "@": batch, "#": batch }) }
		]));

		expect(members()({ ready: ({ state }) => state })).toEqual(items(2*batch));

	});

	it("should hand over the members retrieved", async () => {

		const { members } = mount(catalogue());

		await vi.waitFor(() => expect(members()({ ready: ({ state }) => state })).toEqual(items(batch/2)));

	});

	describe("load()", () => {

		it("should be offered while the last batch is full", async () => {

			const { members } = mount(catalogue(3*batch));

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		});

		it("should be withheld once the collection is exhausted", async () => {

			const { members } = mount(catalogue(batch/2));

			await vi.waitFor(() => expect(members()({ ready: () => true })).toBe(true));

			expect(load(members())).toBeUndefined();

		});

		it("should retrieve the next batch alone, appending it to the items on show", async () => {

			const lookup = catalogue(3*batch);
			const { members } = mount(lookup);

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

			const calls = lookup.mock.calls.length;

			act(() => load(members())!());

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state })).toEqual(items(2*batch)));

			expect(models(lookup).slice(calls)).toEqual([
				{ members: expect.objectContaining({ "@": batch, "#": batch }) }
			]);

		});

		it("should be withheld once a batch comes back short", async () => {

			const { members } = mount(catalogue(batch+batch/2));

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

			act(() => load(members())!());

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(batch+batch/2));

			expect(load(members())).toBeUndefined();

		});

		it("should stay on offer while the next batch is retrieved, asking for nothing more", async () => {

			const lookup = vi.fn().mockImplementationOnce(catalogue(3*batch)).mockImplementation(() => new Promise(() => {}));

			const { members } = mount(lookup);

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

			await act(async () => load(members())!()); // the members notify their change in a microtask
			await act(async () => load(members())!());

			expect(members()({ ready: ({ state }) => state.length })).toBe(batch);
			expect(models(lookup).slice(1)).toEqual([
				{ members: expect.objectContaining({ "@": batch, "#": batch }) }
			]);

		});

	});

	it("should sort the items again from the first batch", async () => {

		const lookup = catalogue(3*batch);
		const { members } = mount(lookup);

		await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		act(() => load(members())!());
		act(() => members()({ ready: ({ sort }) => sort({ label: "desc" }) }));

		await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
			members: { "^label": "desc", "@": 0, "#": batch }
		}));

	});

	describe("order", () => {

		it("should hand over the starting order", async () => {

			const { members } = mount(catalogue());

			await vi.waitFor(() => expect(members()({ ready: ({ order }) => order })).toEqual({ label: "asc" }));

		});

		it("should hand over the order the items were sorted in", async () => {

			const { members } = mount(catalogue());

			await vi.waitFor(() => expect(members()({ ready: () => true })).toBe(true));

			act(() => members()({ ready: ({ sort }) => sort({ label: "desc" }) }));

			await vi.waitFor(() => expect(members()({ ready: ({ order }) => order })).toEqual({ label: "desc" }));

		});

		it("should retrieve the items in the given order", async () => {

			const lookup = catalogue();

			mount(lookup, {}, {}, { order: { label: "desc" } });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: expect.objectContaining({ "^label": "desc", "@": 0 })
			}));

		});

		it("should keep the items as they stand as the order handed over changes", async () => {

			const lookup = catalogue();
			const { members, update } = mount(lookup);

			await vi.waitFor(() => expect(members()({ ready: () => true })).toBe(true));

			const calls = lookup.mock.calls.length;

			update({ order: { label: "desc" } });

			await act(async () => {}); // let any retrieval the update asked for start

			expect(members()({ ready: ({ order }) => order })).toEqual({ label: "asc" });
			expect(lookup.mock.calls.length).toBe(calls);

		});

	});

	describe("limit", () => {

		it("should retrieve as many batches as the given limit at the start", async () => {

			const lookup = catalogue(3*batch);
			const { members } = mount(lookup, {}, {}, { limit: 2*batch });

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state })).toEqual(items(2*batch)));

			expect(models(lookup)).toEqual([
				{ members: expect.objectContaining({ "@": 0, "#": batch }) },
				{ members: expect.objectContaining({ "@": batch, "#": batch }) }
			]);

		});

		it("should start again over a single batch as the criteria change", async () => {

			const lookup = catalogue(3*batch);
			const { collection, members } = mount(lookup, {}, {}, { limit: 2*batch });

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(2*batch));

			const calls = lookup.mock.calls.length;

			act(() => void collection().filter({ "~label": "item" }));

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(batch));

			expect(models(lookup).slice(calls)).toEqual([
				{ members: expect.objectContaining({ "~label": "item", "@": 0, "#": batch }) }
			]);

		});

	});

	describe("reset()", () => {

		it("should be withheld while the items are in the starting order", async () => {

			const { members } = mount(catalogue());

			await vi.waitFor(() => expect(members()({ ready: () => true })).toBe(true));

			expect(reset(members())).toBeUndefined();

		});

		it("should restore the starting order from the first batch", async () => {

			const lookup = catalogue();
			const { members } = mount(lookup);

			await vi.waitFor(() => expect(members()({ ready: () => true })).toBe(true));

			act(() => members()({ ready: ({ sort }) => sort({ label: "desc" }) }));

			await vi.waitFor(() => expect(reset(members())).toBeTypeOf("function"));

			act(() => reset(members())!());

			await vi.waitFor(() => expect(members()({ ready: ({ order }) => order })).toEqual({ label: "asc" }));

			expect(models(lookup).at(-1)).toMatchObject({ members: { "^label": "asc", "@": 0, "#": batch } });
			expect(reset(members())).toBeUndefined();

		});

		it("should be offered while the items start in an order other than the basis", async () => {

			const { members } = mount(catalogue(), {}, {}, { basis: { label: "asc" }, order: { label: "desc" } });

			await vi.waitFor(() => expect(reset(members())).toBeTypeOf("function"));

		});

		it("should restore the basis order", async () => {

			const { members } = mount(catalogue(), {}, {}, { basis: { label: "asc" }, order: { label: "desc" } });

			await vi.waitFor(() => expect(reset(members())).toBeTypeOf("function"));

			act(() => reset(members())!());

			await vi.waitFor(() => expect(members()({ ready: ({ order }) => order })).toEqual({ label: "asc" }));

			expect(reset(members())).toBeUndefined();

		});

	});

	describe("onChange", () => {

		it("should take the order and the limit once as a new order starts over the first batch", async () => {

			const onChange = vi.fn();
			const { members } = mount(catalogue(3*batch), {}, {}, { limit: 2*batch, onChange });

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(2*batch));

			act(() => members()({ ready: ({ sort }) => sort({ label: "desc" }) }));

			await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith({ label: "desc" }, batch));

			expect(onChange).toHaveBeenCalledOnce();

		});

		it("should take the basis order as it is restored", async () => {

			const onChange = vi.fn();
			const { members } = mount(catalogue(), {}, {}, { basis: { label: "asc" }, order: { label: "desc" }, onChange });

			await vi.waitFor(() => expect(reset(members())).toBeTypeOf("function"));

			act(() => reset(members())!());

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ label: "asc" }, batch));

		});

		it("should take the limit as a batch is loaded", async () => {

			const onChange = vi.fn();
			const { members } = mount(catalogue(3*batch), {}, {}, { onChange });

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

			act(() => load(members())!());

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ label: "asc" }, 2*batch));

		});

		it("should take the limit as new criteria start over the first batch", async () => {

			const onChange = vi.fn();
			const { collection, members } = mount(catalogue(3*batch), {}, {}, { limit: 2*batch, onChange });

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(2*batch));

			act(() => void collection().filter({ "~label": "item" }));

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ label: "asc" }, batch));

		});

		it("should not be called with the order and the limit the members start with", async () => {

			const onChange = vi.fn();
			const { members } = mount(catalogue(3*batch), {}, {}, { limit: 2*batch, onChange });

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(2*batch));

			expect(onChange).not.toHaveBeenCalled();

		});

	});

	it("should start again from the first batch as the criteria change", async () => {

		const lookup = catalogue(3*batch);
		const { collection, members } = mount(lookup);

		await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		act(() => load(members())!());
		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
			members: { "~label": "item", "@": 0, "#": batch }
		}));

	});

});
