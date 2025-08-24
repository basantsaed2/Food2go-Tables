import React, { useEffect, useMemo, useState } from 'react';
import { IoAddCircleSharp } from 'react-icons/io5';
import { IoIosRemoveCircle } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Checkbox, SubmitButton } from '../../Components/Components';
import { setProductsCard } from '../../Store/CreateSlices';
import { useAuth } from '../../Context/Auth';

// Helper functions
const calculateTotalPrice = (items, key = 'price') =>
    items.reduce((sum, item) => sum + (item[key] || 0) * (item.count || 1), 0);

const calculateTotalPriceAddons = (items) =>
    items.reduce((sum, item) => sum + (item.price || 0) * (item.count || 1), 0);

const calculateFinalPrice = (product, options, selectedExtras, checkedAddons, checkedExtra) => {
    const base = product?.price || 0;
    const extrasPrice = calculateTotalPrice(selectedExtras);
    const optsPrice = calculateTotalPrice(options);
    const addonsPrice = calculateTotalPriceAddons(checkedAddons);
    const checkedExtraPrice = calculateTotalPrice(checkedExtra);
    const raw = base + extrasPrice + optsPrice;

    let discount = 0;
    if (product?.discount) {
        discount = product.discount.type === 'percentage'
            ? raw * (product.discount.amount / 100)
            : product.discount.amount;
    }

    return (raw - discount + addonsPrice + checkedExtraPrice).toFixed(2);
};

const ProductDetails = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const products = useSelector(state => state.productsFilter.data);
    const product = products.find(p => p.id === Number(productId));
    const { t } = useTranslation();
    const auth = useAuth();

    // State
    const [checkedExclude, setCheckedExclude] = useState([]);
    const [checkedExtra, setCheckedExtra] = useState([]); // [{ id, price, count }]
    const [checkedAddons, setCheckedAddons] = useState([]);
    const [variationList, setVariationList] = useState([]); // [{ variation_id, options: [{ option_id, count: 1 }] }]
    const [options, setOptions] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [productPrice, setProductPrice] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [countProduct, setCountProduct] = useState(1);

    // Handle undefined product
    if (!product) {
        return <div className="text-2xl text-center">{t("ProductNotFound")}</div>;
    }

    console.log("product", product)

    // Memoized extras by option_id
    const extrasByOption = useMemo(() => {
        return (product?.allExtras || []).reduce((map, extra) => {
            if (extra.option_id != null) {
                map[extra.option_id] = map[extra.option_id] || [];
                map[extra.option_id].push(extra);
            }
            return map;
        }, {});
    }, [product?.allExtras]);

    // Calculate prices
    useEffect(() => {
        // Calculate variation options with counts for price computation
        const variationOptions = (variationList || []).reduce((acc, v) => {
            if (!v.options || !product.variations) return acc;
            const variation = product.variations.find(vr => vr.id === v.variation_id);
            if (!variation) return acc;

            const opts = v.options.map(opt => {
                const option = variation.options?.find(o => o.id === opt.option_id);
                if (!option) return null;
                return {
                    ...option,
                    count: opt.count,
                    total_option_price: (option.total_option_price || 0) * opt.count
                };
            }).filter(opt => opt !== null);

            return [...acc, ...opts];
        }, []);

        // Update options state
        setOptions(variationOptions);

        // Calculate product price
        const variationPrice = calculateTotalPrice(variationOptions, 'total_option_price');
        const extrasPrice = calculateTotalPrice(selectedExtras);
        setProductPrice((product?.price || 0) + variationPrice + extrasPrice);

        // Calculate final price
        setFinalPrice(calculateFinalPrice(product, variationOptions, selectedExtras, checkedAddons, checkedExtra));
    }, [product, variationList, selectedExtras, checkedAddons, checkedExtra]);

    // Total price
    const totalPrice = useMemo(() => {
        const productTotal = countProduct * (finalPrice - calculateTotalPriceAddons(checkedAddons));
        const addonsTotal = calculateTotalPriceAddons(checkedAddons);
        return (productTotal + addonsTotal).toFixed(2);
    }, [countProduct, finalPrice, checkedAddons]);

    // Increment/decrement product quantity
    const increment = () => setCountProduct(prev => prev + 1);
    const decrement = () => {
        if (countProduct > 1) {
            setCountProduct(prev => prev - 1);
        }
    };

    // Handlers
    const handleCheckedExclude = id => setCheckedExclude(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

    const handleCheckedExtra = (id, price, min = 0) => {
        setCheckedExtra(prev => {
            const exists = prev.find(x => x.id === id);
            if (exists) {
                return prev.filter(x => x.id !== id); // Deselect
            }
            return [...prev, { id, price, count: Math.max(1, min) }]; // Select with min count
        });
    };

    const incrementExtraCount = (id, max = Infinity) => {
        setCheckedExtra(prev =>
            prev.map(extra =>
                extra.id === id && (max === 0 || extra.count < max)
                    ? { ...extra, count: extra.count + 1 }
                    : extra
            )
        );
    };

    const decrementExtraCount = (id, min = 0) => {
        setCheckedExtra(prev =>
            prev.reduce((acc, extra) => {
                if (extra.id === id) {
                    if (extra.count > Math.max(1, min)) {
                        acc.push({ ...extra, count: extra.count - 1 });
                    } else if (min === 0) {
                        // Remove if optional and count would go below 1
                    } else {
                        acc.push(extra); // Keep if min > 0
                    }
                } else {
                    acc.push(extra);
                }
                return acc;
            }, [])
        );
    };

    const handleCheckedAddons = (id, price) => {
        setCheckedAddons(prev => {
            const exists = prev.find(a => a.id === id);
            return exists
                ? prev.filter(a => a.id !== id)
                : [...prev, { id, count: 1, price }];
        });
    };

    const incrementCount = id => setCheckedAddons(prev =>
        prev.map(a => a.id === id ? { ...a, count: a.count + 1 } : a)
    );

    const decrementCount = id => setCheckedAddons(prev =>
        prev.reduce((acc, a) => {
            if (a.id === id) {
                if (a.count > 1) acc.push({ ...a, count: a.count - 1 });
            } else acc.push(a);
            return acc;
        }, [])
    );

    const handleSetOption = (option, variation) => {
        setVariationList(prev => {
            // Safeguard: Ensure prev is an array
            const safePrev = Array.isArray(prev) ? prev : [];
            console.log('variationList:', safePrev, 'variation:', variation, 'option:', option);

            const variationEntry = safePrev.find(vl => vl.variation_id === variation.id) || { variation_id: variation.id, options: [] };
            const selectedIds = variationEntry.options.map(o => o.option_id);
            const isSelected = selectedIds.includes(option.id);
            const max = variation.max ?? Infinity;
            const totalSelected = selectedIds.length;

            if (variation.type === 'single') {
                if (option.id === null) {
                    // Deselect all options
                    return safePrev.filter(v => v.variation_id !== variation.id);
                }
                if (!isSelected) {
                    // Select new option
                    return [
                        ...safePrev.filter(v => v.variation_id !== variation.id),
                        { variation_id: variation.id, options: [{ option_id: option.id, count: 1 }] }
                    ];
                } else {
                    // Allow deselecting
                    return safePrev.filter(v => v.variation_id !== variation.id);
                }
            } else {
                // Multiple type: Toggle option, count is always 1
                let newOptions;
                if (isSelected) {
                    // Deselect option
                    newOptions = variationEntry.options.filter(o => o.option_id !== option.id);
                } else {
                    // Select option if below max
                    if (totalSelected < max) {
                        newOptions = [...variationEntry.options, { option_id: option.id, count: 1 }];
                    } else {
                        return safePrev; // Cannot exceed max
                    }
                }

                if (newOptions.length === 0) {
                    return safePrev.filter(v => v.variation_id !== variation.id);
                }

                return [
                    ...safePrev.filter(v => v.variation_id !== variation.id),
                    { variation_id: variation.id, options: newOptions }
                ];
            }
        });
    };

    const handleSetExtraOption = extra => setSelectedExtras(prev =>
        prev.some(x => x.id === extra.id)
            ? prev.filter(x => x.id !== extra.id)
            : [...prev, extra]
    );

    // Validate variations and extras for Add to Cart
    const isAddDisabled = () => {
        // Validate variations
        for (const variation of product.variations || []) {
            const min = variation.required === 0 ? 0 : (variation.min ?? (variation.required ? 1 : 0));
            const max = variation.max ?? Infinity;
            const variationEntry = (variationList || []).find(vl => vl.variation_id === variation.id);
            const selectedCount = variationEntry?.options.length || 0;

            if (variation.type === 'single') {
                if (selectedCount > 1 || selectedCount < min) return true;
            } else {
                if (selectedCount < min || selectedCount > max) return true;
            }
        }
        // Validate extras only if selected
        for (const extra of product.allExtras || []) {
            const extraEntry = checkedExtra.find(e => e.id === extra.id);
            if (!extraEntry) continue; // skip if not selected

            const min = extra.min ?? 0;
            const max = extra.max === 0 ? Infinity : extra.max;
            const count = extraEntry?.count || 0;

            if (count < min || count > max) return true;
        }

        return false;
    };

    // Add to cart
    const handleAddProduct = () => {
        const validationErrors = [];

        // Validate variations
        for (const variation of product.variations || []) {
            const min = variation.required === 0 ? 0 : 1;
            const max = variation.max ?? Infinity;
            const variationEntry = (variationList || []).find(vl => vl.variation_id === variation.id);
            const selectedCount = variationEntry?.options.length || 0;

            if (variation.type === 'single') {
                if (selectedCount > 1) {
                    auth.toastError(`Only one option can be selected for variation ${variation.name}`);
                    return;
                } else if (selectedCount < min) {
                    auth.toastError(`You must select ${min} option${min !== 1 ? 's' : ''} from variation ${variation.name}`);
                    return;
                }
            } else {
                if (selectedCount < min) {
                    auth.toastError(`You must select at least ${min} option${min !== 1 ? 's' : ''} from variation ${variation.name}`);
                    return;
                } else if (selectedCount > max) {
                    auth.toastError(`You can select up to ${max} option${max !== 1 ? 's' : ''} from variation ${variation.name}`);
                    return;
                }
            }
        }

        // Validate only the selected extras
        for (const extra of product.allExtras || []) {
            const extraEntry = checkedExtra.find(e => e.id === extra.id);
            if (!extraEntry) continue;

            const min = extra.min ?? 0;
            const max = extra.max === 0 ? Infinity : extra.max;
            const count = extraEntry?.count || 0;

            if (count < min) {
                auth.toastError(`Extra ${extra.name} must be selected at least ${min} time${min !== 1 ? 's' : ''}`);
                return;
            } else if (count > max && max !== Infinity) {
                auth.toastError(`Extra ${extra.name} can be selected up to ${max} time${max !== 1 ? 's' : ''}`);
                return;
            }
        }

        const addonsTotal = calculateTotalPriceAddons(checkedAddons);
        const productTotal = countProduct * (finalPrice - addonsTotal);
        const total = (productTotal + addonsTotal).toFixed(2);

        const newProduct = {
            productId: product.id,
            numberId: `${Date.now()}-${Math.random().toString(36).slice(-4)}`,
            name: product.name,
            description: product.description,
            image: product.image_link,
            addons: checkedAddons,
            extraProduct: checkedExtra,
            extraOptions: selectedExtras,
            excludes: checkedExclude,
            variations: variationList,
            options,
            note: '',
            tax: product.tax,
            discount: product.discount,
            passProductPrice: product.price + calculateTotalPriceAddons(checkedAddons) + calculateTotalPrice(options, 'total_option_price') + calculateTotalPrice(selectedExtras) + calculateTotalPrice(checkedExtra),
            passPrice: product.price,
            total,
            count: countProduct,
        };

        dispatch(setProductsCard(newProduct));
        navigate('/cart', { replace: true });
    };
    // Render
    return (
        <div className="flex items-start justify-between w-full p-2 sm:flex-col-reverse xl:flex-row sm:h-full gap-7">
            {/* Details Side */}
            <div className="flex flex-col sm:w-full xl:w-6/12 sm:h-auto xl:h-full sm:pl-5 xl:pl-8 sm:pr-5 xl:pr-0 gap-y-6 xl:mt-12">
                {/* Title && Price */}
                <div className="flex flex-col items-start w-full gap-y-5">
                    <span className="w-full sm:text-3xl xl:text-5xl font-TextFontMedium text-mainColor">{product?.name || ''}</span>
                    <div className="flex items-center justify-start w-full gap-x-2">
                        <div>
                            <span className="sm:text-3xl lg:text-5xl text-mainColor font-TextFontMedium">
                                {totalPrice} EGP
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full gap-y-2">
                        <span className="text-mainColor sm:text-xl xl:text-2xl font-TextFontMedium">{t("ingridents")}:</span>
                        <div className="w-full text-gray-600 sm:text-base xl:text-lg font-TextFontRegular leading-relaxed">
                            {product?.description || 'No description available.'}
                        </div>
                    </div>
                </div>
                {/* Details */}
                <div className="flex flex-col gap-6 p-5">
                    {/* Global Extras */}
                    {product.allExtras?.length > 0 && (
                        <section>
                            <h3 className="text-3xl text-mainColor font-semibold">{t("Extras")}</h3>
                            <div className="flex flex-col gap-3 mt-2">
                                {product.allExtras
                                    .filter(x => x.option_id === null)
                                    .map(x => {
                                        const priceToUse =
                                            product.taxes === "included" && product.discount_id !== null
                                                ? x.price_after_discount
                                                : x.price_after_tax;
                                        const selectedExtra = checkedExtra.find(e => e.id === x.id);
                                        const count = selectedExtra?.count || 0;
                                        const min = x.min ?? 0;
                                        const max = x.max === 0 ? Infinity : x.max;
                                        const canDecrement = count > Math.max(1, min);
                                        const canIncrement = max === Infinity || count < max;

                                        return (
                                            <div key={x.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    handleChecked={() => handleCheckedExtra(x.id, priceToUse, min)}
                                                    isChecked={!!selectedExtra}
                                                    aria-label={`Add ${x.name} for ${priceToUse.toFixed(2)} ${t("currency")}`}
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {x.name} – {priceToUse.toFixed(2)} {t("currency")}
                                                </span>
                                                {selectedExtra && (
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <IoIosRemoveCircle
                                                            onClick={() => decrementExtraCount(x.id, min)}
                                                            className={`text-2xl ${canDecrement ? 'cursor-pointer text-mainColor' : 'opacity-50 cursor-not-allowed'}`}
                                                            aria-label={`Decrease ${x.name} quantity`}
                                                        />
                                                        <span className="text-sm">{count}</span>
                                                        <IoAddCircleSharp
                                                            onClick={() => incrementExtraCount(x.id, max)}
                                                            className={`text-2xl ${canIncrement ? 'cursor-pointer text-mainColor' : 'opacity-50 cursor-not-allowed'}`}
                                                            aria-label={`Increase ${x.name} quantity`}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </section>
                    )}
                    {/* Excludes */}
                    {product.excludes?.length > 0 && (
                        <section>
                            <h3 className="text-3xl text-mainColor font-semibold">{t("Exclude")}</h3>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {product.excludes.map(ex => (
                                    <label key={ex.id} className="flex items-center gap-2">
                                        <Checkbox
                                            handleChecked={() => handleCheckedExclude(ex.id)}
                                            isChecked={checkedExclude.includes(ex.id)}
                                            aria-label={`Exclude ${ex.name}`}
                                        />
                                        <span className="text-sm text-gray-700">{ex.name}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}
                    {/* Addons */}
                    {product.addons?.length > 0 && (
                        <section>
                            <h3 className="text-3xl text-mainColor font-semibold">{t("Addons")}</h3>
                            <div className="flex flex-col gap-4 mt-2">
                                {product.addons.map(addon => {
                                    const sel = checkedAddons.find(a => a.id === addon.id);
                                    return (
                                        <div key={addon.id} className="flex items-center gap-2">
                                            <Checkbox
                                                handleChecked={() => handleCheckedAddons(addon.id, addon.price)}
                                                isChecked={!!sel}
                                                aria-label={`Add ${addon.name} for ${addon.price.toFixed(2)} ${t("currency")}`}
                                            />
                                            <span className="text-sm text-gray-700">{addon.name} – {addon.price.toFixed(2)} {t("currency")}</span>
                                            {sel && (
                                                <div className="flex items-center gap-2 ml-4">
                                                    <IoIosRemoveCircle
                                                        onClick={() => decrementCount(addon.id)}
                                                        className="text-2xl cursor-pointer text-mainColor"
                                                        aria-label={`Decrease ${addon.name} quantity`}
                                                    />
                                                    <span className="text-sm">{sel.count}</span>
                                                    <IoAddCircleSharp
                                                        onClick={() => incrementCount(addon.id)}
                                                        className="text-2xl cursor-pointer text-mainColor"
                                                        aria-label={`Increase ${addon.name} quantity`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                    {/* Variations */}
                    {product.variations?.map(variation => (
                        <section key={variation.id} className="mt-8 bg-gray-50 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-mainColor">
                                    {variation.name} {variation.required !== 0 ? <span className="text-sm text-red-500">*</span> : null}
                                </h3>
                                <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">
                                    {variation.type === 'single' ? t('selectOne') : t('selectMultiple')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                {variation.required === 0
                                    ? variation.type === 'single'
                                        ? t('optionalSelectOne', { variation: variation.name })
                                        : t('optionalSelectMultiple', { variation: variation.name })
                                    : variation.type === 'single'
                                        ? t('mustSelectOne', { variation: variation.name })
                                        : variation.min > 0
                                            ? t('selectBetween', { min: variation.min, max: variation.max ?? 'any', variation: variation.name })
                                            : t('mustSelectAtLeastOne', { variation: variation.name })}
                            </p>
                            {variation.type === 'single' ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {variation.required === 0 && (
                                        <label
                                            className={`flex items-center justify-between bg-white border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${!variationList.find(vl => vl.variation_id === variation.id)
                                                ? 'border-mainColor bg-mainColor/10 shadow-md'
                                                : 'border-gray-200 hover:border-mainColor'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`variation-${variation.id}`}
                                                    checked={!variationList.find(vl => vl.variation_id === variation.id)}
                                                    onChange={() => handleSetOption({ id: null }, variation)}
                                                    className="h-5 w-5 text-mainColor"
                                                    aria-label={t('none')}
                                                />
                                                <span className="text-base font-medium text-gray-800">{t('none')}</span>
                                            </div>
                                            {/* <span className="text-sm font-semibold text-gray-600">0.00 {t("currency")}</span> */}
                                        </label>
                                    )}
                                    {variation.options.map(option => (
                                        <label
                                            key={option.id}
                                            className={`flex items-center justify-between bg-white border-2 rounded-lg p-4 transition-all duration-300 hover:shadow-md ${variationList.find(vl => vl.variation_id === variation.id)?.options.some(o => o.option_id === option.id)
                                                ? 'border-mainColor bg-mainColor/10 shadow-md'
                                                : 'border-gray-200 hover:border-mainColor'
                                                } ${option.status === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`variation-${variation.id}`}
                                                    value={option.id}
                                                    checked={variationList.find(vl => vl.variation_id === variation.id)?.options.some(o => o.option_id === option.id)}
                                                    onChange={() => handleSetOption(option, variation)}
                                                    disabled={option.status === 0}
                                                    className="h-5 w-5 text-mainColor"
                                                    aria-label={`Select ${option.name} for ${option.total_option_price.toFixed(2)} ${t("currency")}`}
                                                />
                                                <span className="text-base font-medium text-gray-800">{option.name}</span>
                                            </div>
                                            {/* <span className="text-sm font-semibold text-gray-600">
                                                {option.total_option_price.toFixed(2)} {t("currency")}
                                            </span> */}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {variation.options.map(option => {
                                        const variationEntry = (variationList || []).find(vl => vl.variation_id === variation.id);
                                        const isSelected = variationEntry?.options.some(o => o.option_id === option.id);
                                        const totalSelected = variationEntry?.options.length || 0;
                                        const max = variation.max ?? Infinity;
                                        const disableCheck = !isSelected && totalSelected >= max;

                                        return (
                                            <label
                                                key={option.id}
                                                className={`flex items-center justify-between bg-white border-2 rounded-lg p-4 transition-all duration-300 hover:shadow-md ${isSelected
                                                    ? 'border-mainColor bg-mainColor/10 shadow-md'
                                                    : 'border-gray-200 hover:border-mainColor'
                                                    } ${disableCheck || option.status === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSetOption(option, variation)}
                                                        disabled={disableCheck || option.status === 0}
                                                        className="h-5 w-5 text-mainColor"
                                                        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${option.name} for ${option.total_option_price.toFixed(2)} ${t("currency")}`}
                                                    />
                                                    <span className="text-base font-medium text-gray-800">{option.name}</span>
                                                </div>
                                                {/* <span className="text-sm font-semibold text-gray-600">
                                                    {option.total_option_price.toFixed(2)} {t("currency")}
                                                </span> */}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            {/* Option-specific extras */}
                            {variationList
                                .find(vl => vl.variation_id === variation.id)?.options
                                .map(opt => {
                                    const optionDetails = variation.options.find(o => o.id === opt.option_id);
                                    if (!optionDetails) return null;
                                    const matchingExtras = extrasByOption[opt.option_id] || [];
                                    if (matchingExtras.length === 0) return null;

                                    return (
                                        <div key={opt.option_id} className="mt-4 ml-4 border-t border-gray-200 pt-3">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                {t('extrasFor')} {optionDetails.name}
                                            </h4>
                                            <div className="space-y-2">
                                                {matchingExtras.map(ex => {
                                                    const priceToUse =
                                                        product.taxes === "included" && product.discount_id != null
                                                            ? ex.price_after_discount
                                                            : ex.price_after_tax;
                                                    const selectedExtra = checkedExtra.find(e => e.id === ex.id);
                                                    const count = selectedExtra?.count || 0;
                                                    const min = ex.min ?? 0;
                                                    const max = ex.max === 0 ? Infinity : ex.max;
                                                    const canDecrement = count > Math.max(1, min);
                                                    const canIncrement = max === Infinity || count < max;

                                                    return (
                                                        <div key={ex.id} className="flex items-center gap-2">
                                                            <Checkbox
                                                                handleChecked={() => handleCheckedExtra(ex.id, priceToUse, min)}
                                                                isChecked={!!selectedExtra}
                                                                aria-label={`Add ${ex.name} for ${priceToUse.toFixed(2)} ${t("currency")}`}
                                                            />
                                                            <span className="text-sm text-gray-600">
                                                                {ex.name} – {priceToUse.toFixed(2)} {t("currency")}
                                                            </span>
                                                            {selectedExtra && (
                                                                <div className="flex items-center gap-2 ml-4">
                                                                    <IoIosRemoveCircle
                                                                        onClick={() => decrementExtraCount(ex.id, min)}
                                                                        className={`text-2xl ${canDecrement ? 'cursor-pointer text-mainColor' : 'opacity-50 cursor-not-allowed'}`}
                                                                        aria-label={`Decrease ${ex.name} quantity`}
                                                                    />
                                                                    <span className="text-sm">{count}</span>
                                                                    <IoAddCircleSharp
                                                                        onClick={() => incrementExtraCount(ex.id, max)}
                                                                        className={`text-2xl ${canIncrement ? 'cursor-pointer text-mainColor' : 'opacity-50 cursor-not-allowed'}`}
                                                                        aria-label={`Increase ${ex.name} quantity`}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                        </section>
                    ))}
                    {/* Add to Cart */}
                    <div className="flex flex-col-reverse items-center justify-between gap-3 mt-8 md:flex-row">
                        <SubmitButton
                            text={t("AddToCart")}
                            handleClick={handleAddProduct}
                            disabled={isAddDisabled()}
                        />
                        <div className="flex items-center gap-4">
                            <IoIosRemoveCircle
                                onClick={decrement}
                                className={`cursor-pointer text-5xl text-mainColor ${countProduct === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                aria-label="Decrease product quantity"
                            />
                            <span className="text-5xl">{countProduct}</span>
                            <IoAddCircleSharp
                                onClick={increment}
                                className="text-5xl cursor-pointer text-mainColor"
                                aria-label="Increase product quantity"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Image Side */}
            <div className="mx-auto sm:w-11/12 lg:w-7/12 xl:w-6/12 sm:h-[61vh] md:h-[70vh] lg:px-10 lg:pt-10 xl:h-[91vh] flex items-center lg:items-start justify-end overflow-hidden">
                <img
                    src={product?.image_link || '/src/assets/Images/fallback.png'}
                    className="sm:w-[23rem] md:w-[28rem] lg:w-[33rem] xl:w-[36rem] sm:h-[23rem] md:h-[28rem] lg:h-[33rem] xl:h-[36rem] rounded-[20px] object-cover object-center"
                    alt={product?.name || 'product'}
                />
            </div>
        </div>
    );
};

export default ProductDetails;