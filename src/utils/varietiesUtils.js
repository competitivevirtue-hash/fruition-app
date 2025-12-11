export const fruitVarieties = {
    'apple': [
        { name: 'Gala', image: 'https://images.unsplash.com/photo-1630563451961-62d22a57321a?auto=format&fit=crop&q=80&w=200', desc: 'Sweet & Crisp' },
        { name: 'Fuji', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=200', desc: 'Super Sweet' },
        { name: 'Granny Smith', image: 'https://images.unsplash.com/photo-1570913149827-d2ac011039e9?auto=format&fit=crop&q=80&w=200', desc: 'Tart & Tangy' },
        { name: 'Honeycrisp', image: 'https://images.unsplash.com/photo-1632313620779-7a35de501e74?auto=format&fit=crop&q=80&w=200', desc: 'Juicy & Crunch' },
        { name: 'Red Delicious', image: 'https://images.unsplash.com/photo-1610385973955-f852be83777d?auto=format&fit=crop&q=80&w=200', desc: 'Classic Mild' },
        { name: 'Golden Delicious', image: 'https://images.unsplash.com/photo-1605027628030-9bb6f83535e6?auto=format&fit=crop&q=80&w=200', desc: 'Sweet & Mellow' },
        { name: 'Pink Lady', image: 'https://images.unsplash.com/photo-1628186173006-2591b619623d?auto=format&fit=crop&q=80&w=200', desc: 'Tart-Sweet' }
    ],
    'grape': [
        { name: 'Concord', image: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&q=80&w=200', desc: 'Bold & Jammy' },
        { name: 'Cotton Candy', image: 'https://images.unsplash.com/photo-1537640538965-1756fb179c26?auto=format&fit=crop&q=80&w=200', desc: 'Sugary Sweet' },
        { name: 'Moon Drops', image: 'https://images.unsplash.com/photo-1593976378413-5a04dd631bb5?auto=format&fit=crop&q=80&w=200', desc: 'Crisp & Sweet' },
        { name: 'Red Globe', image: 'https://images.unsplash.com/photo-1625499295557-04dc23568c01?auto=format&fit=crop&q=80&w=200', desc: 'Large & Sweet' }
    ],
    'pear': [
        { name: 'Bartlett', image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=200', desc: 'Classic Sweet' },
        { name: 'Anjou', image: 'https://images.unsplash.com/photo-1631160299919-6a175aa6d189?auto=format&fit=crop&q=80&w=200', desc: 'Citrus Note' },
        { name: 'Bosc', image: 'https://images.unsplash.com/photo-1517462446777-66a7b297b83d?auto=format&fit=crop&q=80&w=200', desc: 'Crisp & Honey' }
    ],
    'orange': [
        { name: 'Navel', image: 'https://images.unsplash.com/photo-1582979512210-99b6a5338509?auto=format&fit=crop&q=80&w=200', desc: 'Sweet & Seedless' },
        { name: 'Blood Orange', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=200', desc: 'Berry Undertone' },
        { name: 'Cara Cara', image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee8b?auto=format&fit=crop&q=80&w=200', desc: 'Sweet & Pink' }
    ]
};

export const getVarieties = (fruitName) => {
    if (!fruitName) return [];
    // Key might be plural or singular, normalize
    const key = fruitName.toLowerCase().trim().replace(/s$/, ''); // simple de-pluralize
    return fruitVarieties[key] || [];
};
