import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 40, className = "", animated = false }) => {
    return (
        <div
            className={`logo-container ${className}`}
            style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <motion.img
                src="/fruition-logo.png"
                alt="Fruition Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                initial={animated ? { scale: 0, opacity: 0, rotate: -180 } : {}}
                animate={animated ? { scale: 1, opacity: 1, rotate: 0 } : {}}
                transition={{ duration: 0.8, ease: "backOut" }}
            />
        </div>
    );
};

export default Logo;
