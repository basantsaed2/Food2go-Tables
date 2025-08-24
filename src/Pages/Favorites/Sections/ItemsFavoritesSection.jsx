import React, { useEffect, useState } from 'react'
import { CardItem, StaticSpinner } from '../../../Components/Components'
import { useGet } from '../../../Hooks/useGet'
const ItemsFavoritesSection = () => {
       const apiUrl = import.meta.env.VITE_API_BASE_URL;
       const { refetch: refetchFavorites, loading: loadingFavorites, data: dataFavorites } = useGet({
              url: `${apiUrl}/customer/home/fav_products`,
       });
       const [favorites, setFavorites] = useState([]);

       useEffect(() => {
              refetchFavorites();
       }, [refetchFavorites]);

       useEffect(() => {
              if (dataFavorites && dataFavorites.products) {
                     setFavorites(dataFavorites.products);
              }
       }, [dataFavorites]);

       if (loadingFavorites) {
              return <StaticSpinner />
       }

       return (
              <>
                     <div className="flex p-4 pt-0 xl:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full mb-8">
                            {favorites.length > 0 ? (
                                   favorites.map((product, index) => (
                                          <CardItem key={index} product={product} />
                                   ))
                            ) : (
                                   <p className="w-full text-center text-mainColor font-semibold text-lg">No favorites products exist.</p>
                            )}


                     </div>
              </>
       )
}

export default ItemsFavoritesSection