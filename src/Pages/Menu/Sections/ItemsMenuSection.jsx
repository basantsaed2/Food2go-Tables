import React from 'react'
import { CardItem } from '../../../Components/Components'
import { useSelector } from 'react-redux'

const ItemsMenuSection = () => {
       const productsFilter = useSelector(state => state.productsFilter?.data);

       return (
              <>
                     <div className="flex p-4 pt-0 xl:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full mb-8">
                     {productsFilter.length > 0 ? (
                            productsFilter.map((product, index) => (
                                   <CardItem key={index} product={product} />
                            ))
                            ) : (
                            <p className="w-full text-center text-mainColor font-semibold text-lg">No products in this category.</p>
                     )}

                     </div>
              </>
       )
}

export default ItemsMenuSection