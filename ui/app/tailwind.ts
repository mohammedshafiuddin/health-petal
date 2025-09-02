// tailwind.ts
import tailwindConfig from '@/tailwind.config';
import { create } from 'twrnc';
// import tailwindConfig from './tailwind.config';

// Create the customized `tw` function
const tw = create(tailwindConfig as any);

export default tw;