import React, { useMemo } from 'react';
import { getFruitImage } from '../utils/fruitUtils';
import basketBack from '../assets/basket-back.png';
import basketFront from '../assets/basket-front.png';
import './FruitBasket.css';

const FruitBasket = ({ fruits }) => {
    const totalItems = fruits.reduce((sum, fruit) => sum + (fruit.quantity || 1), 0);

    // Smart Grouping & Placement Logic
    const visualItems = useMemo(() => {
        const items = [];
        // Define fixed slots in the basket to prevent overlap
        // Using a pseudo-grid in the ellipse area
        const slots = [
            { x: 30, y: 45, z: 10 }, { x: 50, y: 48, z: 11 }, { x: 70, y: 45, z: 10 },
            { x: 40, y: 55, z: 20 }, { x: 60, y: 55, z: 21 },
            { x: 50, y: 65, z: 30 }
        ];

        let slotIndex = 0;

        fruits.forEach(fruit => {
            if (slotIndex >= slots.length) return; // Basket full visually

            const slot = slots[slotIndex];
            const quantity = fruit.quantity || 1;

            items.push({
                id: fruit.id,
                name: fruit.name,
                image: getFruitImage(fruit.name),
                quantity: quantity,
                isGroup: quantity > 1,
                style: {
                    top: `${slot.y}%`,
                    left: `${slot.x}%`,
                    transform: `translate(-50%, -50%) scale(${0.9 + (slot.y - 45) / 100})`, // Subtle depth scale
                    zIndex: slot.z
                }
            });
            slotIndex++;
        });
        return items;
    }, [fruits]);

    return (
        <div className="fruit-basket-container">
            <div className="basket-view">
                {/* Layer 1: Back of Basket */}
                <img src={basketBack} alt="Basket Back" className="basket-layer-back" style={{ zIndex: 1 }} />

                {/* Layer 2: Scattered Fruits */}
                <div className="basket-items-layer" style={{ zIndex: 2 }}>
                    {visualItems.length > 0 && (
                        visualItems.map(item => (
                            <div
                                key={item.id}
                                className="basket-item-wrapper"
                                style={{ position: 'absolute', ...item.style, width: '60px', height: '60px' }} // Container for positioning
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                                />
                                {item.isGroup && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-5px',
                                        right: '-5px',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        padding: '2px 6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        border: '1px solid white'
                                    }}>
                                        x{item.quantity}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>


                {/* Layer 3: Front of Basket */}
                <img
                    src={basketFront}
                    alt="Basket Front"
                    className="basket-layer-front"
                    style={{ zIndex: 3, pointerEvents: 'none', transform: 'translateY(16px)' }}
                />
            </div>
        </div>
    );
};

export default FruitBasket;
