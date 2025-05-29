import { FoodsPageComponent } from '@/components/FoodPage'
import React, { Suspense } from 'react'

const FoodsPageStart = () => {
  return (<Suspense>
    <FoodsPageComponent/>
  </Suspense>
  )
}

export default FoodsPageStart