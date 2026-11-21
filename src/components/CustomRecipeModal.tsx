"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Plus, Trash2, X } from "lucide-react";
import { getIngredientById, ingredientList } from "@/data/ingredients";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { usePriceOverrides } from "@/hooks/usePriceOverrides";
import { compressRecipePhoto } from "@/lib/imageCompressor";
import {
  calculateRecipeCost,
  formatAmount,
  formatPHP,
  resolveIngredient,
} from "@/lib/costCalculator";
import type { Recipe, RecipeCategory, RecipeIngredient } from "@/types/recipe";

interface CustomRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IngredientRow {
  id: string;
  ingredientId: string;
  amount: string;
}

interface StepRow {
  id: string;
  instruction: string;
}

const CATEGORIES: readonly RecipeCategory[] = ["Karne", "Sabaw", "Prito / Gisa", "Gulay"];

const CATEGORY_EMOJI: Record<RecipeCategory, string> = {
  Karne: "🍖",
  Sabaw: "🍲",
  "Prito / Gisa": "🍳",
  Gulay: "🥬",
};

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseNonNegativeInteger(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function parseServings(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function CustomRecipeModal({ isOpen, onClose }: CustomRecipeModalProps) {
  const { addCustomRecipe } = useCustomRecipes();
  const { overrides } = usePriceOverrides();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoRequestRef = useRef(0);
  const nextId = useRef(0);
  const makeId = (prefix: string) => `${prefix}-${nextId.current++}`;

  const createIngredientRow = (): IngredientRow => ({
    id: makeId("ingredient"),
    ingredientId: "",
    amount: "",
  });

  const createStepRow = (): StepRow => ({
    id: makeId("step"),
    instruction: "",
  });

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState<RecipeCategory>("Karne");
  const [baseServings, setBaseServings] = useState("4");
  const [prepTimeMins, setPrepTimeMins] = useState("15");
  const [cookTimeMins, setCookTimeMins] = useState("30");
  const [tipidTip, setTipidTip] = useState("");
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>(() => [createIngredientRow()]);
  const [stepRows, setStepRows] = useState<StepRow[]>(() => [createStepRow()]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isOptimizingPhoto, setIsOptimizingPhoto] = useState(false);

  const dialogTitleId = "custom-recipe-modal-title";
  const formHeadingId = "custom-recipe-form-heading";
  const previewHeadingId = "custom-recipe-preview-heading";
  const photoHeadingId = "custom-recipe-photo-heading";
  const photoHelpId = "custom-recipe-photo-help";
  const photoErrorId = "custom-recipe-photo-error";

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const requestId = ++photoRequestRef.current;
    setIsOptimizingPhoto(true);
    setPhotoError("");
    setErrors([]);

    try {
      const dataUrl = await compressRecipePhoto(file);
      if (requestId !== photoRequestRef.current) return;

      setPhotoData(dataUrl);
      setPhotoName(file.name);
    } catch (error) {
      if (requestId !== photoRequestRef.current) return;

      setPhotoData(null);
      setPhotoName("");
      setPhotoError(
        error instanceof Error
          ? error.message
          : "Could not optimize that photo. Please try another image.",
      );
    } finally {
      if (requestId === photoRequestRef.current) {
        setIsOptimizingPhoto(false);
      }
    }
  }

  function removePhoto() {
    photoRequestRef.current += 1;
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
    setPhotoData(null);
    setPhotoName("");
    setPhotoError("");
    setIsOptimizingPhoto(false);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const draftIngredients = useMemo(() => {
    const result: RecipeIngredient[] = [];

    for (const row of ingredientRows) {
      const ingredient = getIngredientById(row.ingredientId);
      const amount = parsePositiveNumber(row.amount);
      if (!ingredient || amount === null) continue;

      result.push({
        ingredientId: ingredient.id,
        amount,
        displayAmount: `${formatAmount(amount)} ${ingredient.unit}`,
        unit: ingredient.unit,
      });
    }

    return result;
  }, [ingredientRows]);

  const previewCost = useMemo(() => {
    const servings = parseServings(baseServings);
    if (draftIngredients.length === 0 || servings === null) return null;

    const draftRecipe: Recipe = {
      slug: "custom-preview",
      title: title.trim() || "Your custom ulam",
      tagline: tagline.trim(),
      category,
      prepTimeMins: parseNonNegativeInteger(prepTimeMins) ?? 15,
      cookTimeMins: parseNonNegativeInteger(cookTimeMins) ?? 30,
      baseServings: servings,
      emoji: CATEGORY_EMOJI[category],
      ingredients: draftIngredients,
      steps: [{ id: "custom-preview-step", instruction: "Preview" }],
      tipidTip: tipidTip.trim() || "Tipid tip",
      isCustom: true,
    };

    try {
      return calculateRecipeCost(draftRecipe, servings, "palengke", overrides);
    } catch {
      return null;
    }
  }, [baseServings, category, cookTimeMins, draftIngredients, overrides, prepTimeMins, tagline, tipidTip, title]);

  function resetForm() {
    photoRequestRef.current += 1;
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
    setTitle("");
    setTagline("");
    setCategory("Karne");
    setBaseServings("4");
    setPrepTimeMins("15");
    setCookTimeMins("30");
    setTipidTip("");
    setIngredientRows([createIngredientRow()]);
    setStepRows([createStepRow()]);
    setErrors([]);
    setIsSaving(false);
    setPhotoData(null);
    setPhotoName("");
    setPhotoError("");
    setIsOptimizingPhoto(false);
  }

  function validateForm(): string[] {
    const nextErrors: string[] = [];
    const ingredientIds = draftIngredients.map((item) => item.ingredientId);
    const steps = stepRows.map((row) => row.instruction.trim()).filter(Boolean);

    if (draftIngredients.length === 0) {
      nextErrors.push("Add at least one ingredient with a valid amount.");
    }

    if (new Set(ingredientIds).size !== ingredientIds.length) {
      nextErrors.push("Each ingredient can only be added once. Combine duplicate rows instead.");
    }

    if (steps.length === 0) {
      nextErrors.push("Add at least one cooking step.");
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || isOptimizingPhoto || !event.currentTarget.reportValidity()) return;

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    const servings = parseServings(baseServings);
    const prep = parseNonNegativeInteger(prepTimeMins);
    const cook = parseNonNegativeInteger(cookTimeMins);

    if (servings === null || prep === null || cook === null) {
      setErrors(["Check the servings and time fields, then save again."]);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setIsSaving(true);

    const recipe: Recipe = {
      slug: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      tagline: tagline.trim(),
      category,
      prepTimeMins: prep,
      cookTimeMins: cook,
      baseServings: servings,
      emoji: CATEGORY_EMOJI[category],
      ...(photoData ? { image: photoData } : {}),
      ingredients: draftIngredients,
      steps: stepRows.map((row, index) => ({
        id: `custom-step-${index + 1}`,
        instruction: row.instruction.trim(),
      })),
      tipidTip: tipidTip.trim() || "Plan your ingredients first, then cook and enjoy your own lutong-bahay ulam.",
      isCustom: true,
    };

    const result = addCustomRecipe(recipe);
    if (!result.ok) {
      setErrors([result.message]);
      setIsSaving(false);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    resetForm();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={dialogTitleId}
      onClose={onClose}
      className="no-print max-h-[90dvh] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto rounded-3xl border border-charcoal/10 bg-white p-0 shadow-2xl backdrop:bg-charcoal/60"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-charcoal/10 bg-white px-5 py-5 sm:px-7">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-adobo">
            Your own ulam
          </p>
          <h2 id={dialogTitleId} className="mt-1 text-2xl font-black tracking-tight text-charcoal">
            Add My Custom Ulam
          </h2>
          <p className="mt-1 text-sm text-charcoal/75">
            We&apos;ll price it automatically from the current ingredient list.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/75 transition-colors hover:border-adobo hover:text-adobo"
        >
          <X size={20} aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <form aria-labelledby={formHeadingId} onSubmit={handleSubmit} className="px-5 py-6 sm:px-7">
        <h3 id={formHeadingId} className="text-lg font-black text-charcoal">
          Recipe details
        </h3>

        {errors.length > 0 ? (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            aria-live="polite"
            className="mt-4 rounded-2xl border border-adobo/30 bg-adobo-soft px-4 py-3 text-sm text-adobo-dark outline-none"
          >
            <p className="font-black">Please fix these before saving:</p>
            <ul className="mt-1 list-disc pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="custom-title" className="text-xs font-black uppercase tracking-wider text-charcoal/75">
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="custom-title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors([]);
              }}
              required
              maxLength={80}
              autoFocus
              className="mt-2 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 text-base font-semibold outline-none focus:border-adobo"
            />
          </div>

          <div>
            <label htmlFor="custom-category" className="text-xs font-black uppercase tracking-wider text-charcoal/75">
              Category <span aria-hidden="true">*</span>
            </label>
            <select
              id="custom-category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as RecipeCategory)}
              required
              className="mt-2 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 text-base font-semibold outline-none focus:border-adobo"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="custom-tagline" className="text-xs font-black uppercase tracking-wider text-charcoal/75">
              Tagline
            </label>
            <input
              id="custom-tagline"
              name="tagline"
              type="text"
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              maxLength={140}
              placeholder="e.g. Lola's Wednesday gisa"
              className="mt-2 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 text-base font-semibold outline-none focus:border-adobo"
            />
          </div>

          <div>
            <label htmlFor="custom-servings" className="text-xs font-black uppercase tracking-wider text-charcoal/75">
              Base Servings <span aria-hidden="true">*</span>
            </label>
            <input
              id="custom-servings"
              name="baseServings"
              type="number"
              min="1"
              max="20"
              step="1"
              inputMode="numeric"
              value={baseServings}
              onChange={(event) => setBaseServings(event.target.value)}
              required
              className="mt-2 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 text-base font-semibold outline-none focus:border-adobo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="custom-prep" className="text-xs font-black uppercase tracking-wider text-charcoal/75">
                Prep Mins <span aria-hidden="true">*</span>
              </label>
              <input
                id="custom-prep"
                name="prepTimeMins"
                type="number"
                min="0"
                max="480"
                step="1"
                inputMode="numeric"
                value={prepTimeMins}
                onChange={(event) => setPrepTimeMins(event.target.value)}
                required
                className="mt-2 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 text-base font-semibold outline-none focus:border-adobo"
              />
            </div>
            <div>
              <label htmlFor="custom-cook" className="text-xs font-black uppercase tracking-wider text-charcoal/75">
                Cook Mins <span aria-hidden="true">*</span>
              </label>
              <input
                id="custom-cook"
                name="cookTimeMins"
                type="number"
                min="0"
                max="480"
                step="1"
                inputMode="numeric"
                value={cookTimeMins}
                onChange={(event) => setCookTimeMins(event.target.value)}
                required
                className="mt-2 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 text-base font-semibold outline-none focus:border-adobo"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="custom-tip" className="text-xs font-black uppercase tracking-wider text-charcoal/75">
              Tipid Tip
            </label>
            <textarea
              id="custom-tip"
              name="tipidTip"
              rows={2}
              value={tipidTip}
              onChange={(event) => setTipidTip(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 py-2 text-base font-semibold outline-none focus:border-adobo"
            />
          </div>
        </div>

        <fieldset className="mt-7 rounded-2xl border border-charcoal/10 bg-cream/40 p-4">
          <legend className="px-2 text-xs font-black uppercase tracking-wider text-charcoal/75">
            Ingredients
          </legend>

          <div className="mt-2 grid gap-3">
            {ingredientRows.map((row, index) => {
              const selected = resolveIngredient(row.ingredientId, overrides);

              return (
                <div key={row.id} className="rounded-2xl border border-charcoal/10 bg-white p-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`custom-ingredient-${row.id}`}
                        className="text-[11px] font-black uppercase tracking-wider text-charcoal/75"
                      >
                        Ingredient {index + 1} <span aria-hidden="true">*</span>
                      </label>
                      <select
                        id={`custom-ingredient-${row.id}`}
                        name={`ingredient-${row.id}`}
                        value={row.ingredientId}
                        onChange={(event) => {
                          setIngredientRows((current) =>
                            current.map((item) =>
                              item.id === row.id ? { ...item, ingredientId: event.target.value } : item,
                            ),
                          );
                          setErrors([]);
                        }}
                        required
                        className="mt-1.5 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 text-base font-semibold outline-none focus:border-adobo"
                      >
                        <option value="">Choose ingredient…</option>
                        {ingredientList.map((ingredient) => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} — {formatPHP(resolveIngredient(ingredient.id, overrides)?.pricePerUnit ?? ingredient.pricePerUnit, { forceDecimals: true })}/{ingredient.unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setIngredientRows((current) => current.filter((item) => item.id !== row.id))
                      }
                      className="mt-6 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/75 transition-colors hover:border-adobo hover:text-adobo"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                      <span className="sr-only">Remove ingredient {index + 1}</span>
                    </button>
                  </div>

                  {selected ? (
                    <p className="mt-2 text-[11px] font-semibold text-charcoal/75">
                      Unit: {selected.unit} · Base rate: {formatPHP(selected.pricePerUnit, { forceDecimals: true })}/{selected.unit} · {selected.palengkePackLabel}
                    </p>
                  ) : null}

                  <div className="mt-3">
                    <label
                      htmlFor={`custom-amount-${row.id}`}
                      className="text-[11px] font-black uppercase tracking-wider text-charcoal/75"
                    >
                      Amount <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id={`custom-amount-${row.id}`}
                      name={`amount-${row.id}`}
                      type="number"
                      min="0.01"
                      step="any"
                      inputMode="decimal"
                      value={row.amount}
                      onChange={(event) => {
                        setIngredientRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, amount: event.target.value } : item,
                          ),
                        );
                        setErrors([]);
                      }}
                      placeholder={selected ? selected.unit : "e.g. 250"}
                      required
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 text-base font-semibold outline-none focus:border-adobo"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {ingredientRows.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-charcoal/75">
              No ingredients yet. Add at least one so we can compute the cost.
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => setIngredientRows((current) => [...current, createIngredientRow()])}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-adobo/30 bg-white px-4 text-sm font-black text-adobo transition-colors hover:bg-adobo-soft"
          >
            <Plus size={16} aria-hidden="true" />
            Add ingredient
          </button>
        </fieldset>

        <section aria-labelledby={previewHeadingId} className="mt-4 rounded-2xl border border-calamansi/25 bg-calamansi-soft/60 p-4">
          <h3 id={previewHeadingId} className="text-sm font-black uppercase tracking-wider text-calamansi">
            Live cost preview
          </h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-charcoal/75">
                Est. Palengke Total
              </dt>
              <dd className="mt-1 text-xl font-black text-charcoal">
                {previewCost ? formatPHP(previewCost.estimatedPalengkeOutOfPocket, { forceDecimals: true }) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-charcoal/75">
                Cost per Serving
              </dt>
              <dd className="mt-1 text-xl font-black text-adobo">
                {previewCost ? formatPHP(previewCost.costPerServing, { forceDecimals: true }) : "—"}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] font-semibold text-charcoal/75">
            Uses palengke reference prices from the current ingredient list.
          </p>
        </section>

        <fieldset className="mt-7 rounded-2xl border border-charcoal/10 bg-cream/40 p-4">
          <legend className="px-2 text-xs font-black uppercase tracking-wider text-charcoal/75">
            Cooking steps
          </legend>

          <div className="mt-2 grid gap-3">
            {stepRows.map((row, index) => (
              <div key={row.id} className="rounded-2xl border border-charcoal/10 bg-white p-3">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-adobo text-sm font-black text-white"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`custom-step-${row.id}`}
                      className="text-[11px] font-black uppercase tracking-wider text-charcoal/75"
                    >
                      Step {index + 1} <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id={`custom-step-${row.id}`}
                      name={`step-${row.id}`}
                      rows={2}
                      value={row.instruction}
                      onChange={(event) => {
                        setStepRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, instruction: event.target.value } : item,
                          ),
                        );
                        setErrors([]);
                      }}
                      required
                      placeholder="Describe what to do…"
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 py-2 text-base font-semibold outline-none focus:border-adobo"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setStepRows((current) => current.filter((item) => item.id !== row.id))}
                    className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/75 transition-colors hover:border-adobo hover:text-adobo"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                    <span className="sr-only">Remove step {index + 1}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {stepRows.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-charcoal/75">
              No steps yet. Add at least one so you can cook it later.
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => setStepRows((current) => [...current, createStepRow()])}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-adobo/30 bg-white px-4 text-sm font-black text-adobo transition-colors hover:bg-adobo-soft"
          >
            <Plus size={16} aria-hidden="true" />
            Add step
          </button>
        </fieldset>

        <section aria-labelledby={photoHeadingId} className="mt-7 rounded-2xl border border-dashed border-charcoal/20 bg-cream/40 p-4">
          <h3 id={photoHeadingId} className="text-xs font-black uppercase tracking-wider text-charcoal/75">
            Dish Photo (Optional)
          </h3>
          <p id={photoHelpId} className="mt-2 text-[11px] font-semibold text-charcoal/75">
            Choose a JPG, PNG, or WebP from this device. We resize it to 600px and keep it in this browser.
          </p>

          <label
            htmlFor="custom-photo"
            className="mt-3 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-adobo/35 bg-white px-4 py-5 text-center transition-colors hover:border-adobo"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-adobo-soft text-adobo">
              <Camera size={20} aria-hidden="true" />
            </span>
            <span aria-live="polite" className="text-sm font-black text-adobo">
              {isOptimizingPhoto
                ? "Optimizing photo..."
                : photoData
                  ? "Choose a different photo"
                  : "Choose a dish photo"}
            </span>
            <span className="max-w-full truncate text-[11px] font-semibold text-charcoal/70">
              {photoName || "Optional · compressed automatically"}
            </span>
          </label>
          <input
            ref={photoInputRef}
            id="custom-photo"
            name="dishPhoto"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            aria-describedby={photoError ? `${photoHelpId} ${photoErrorId}` : photoHelpId}
            aria-invalid={photoError ? true : undefined}
            className="sr-only"
          />
          {photoError ? (
            <p
              id={photoErrorId}
              aria-live="polite"
              className="mt-2 text-xs font-bold text-adobo-dark"
            >
              {photoError}
            </p>
          ) : null}
          {photoData ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-charcoal/10 bg-white p-2">
              <Image
                src={photoData}
                alt={`Selected dish photo preview for ${title.trim() || "your custom ulam"}`}
                width={72}
                height={48}
                unoptimized
                className="h-12 w-[72px] rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-charcoal">{photoName || "Dish photo"}</p>
                <p className="text-[11px] font-semibold text-charcoal/75">Ready to save with your ulam.</p>
              </div>
              <button
                type="button"
                onClick={removePhoto}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-charcoal/15 px-3 text-xs font-black text-charcoal/75 transition-colors hover:border-adobo hover:text-adobo"
              >
                <Trash2 size={14} aria-hidden="true" />
                Remove Photo
              </button>
            </div>
          ) : null}
        </section>

        <div className="sticky bottom-0 -mx-5 mt-7 flex flex-wrap items-center justify-end gap-3 border-t border-charcoal/10 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-full border border-charcoal/15 px-5 text-sm font-black text-charcoal/70 transition-colors hover:border-adobo/40 hover:text-adobo"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || isOptimizingPhoto}
            className="inline-flex min-h-11 items-center rounded-full bg-adobo px-6 text-sm font-black text-white shadow-sm transition-colors hover:bg-adobo-dark disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? "Saving…" : isOptimizingPhoto ? "Optimizing photo..." : "Save My Ulam"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
