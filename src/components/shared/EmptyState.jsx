import React from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const EmptyState = ({ 
  title, 
  description, 
  icon: Icon = FolderOpen, 
  action,
  className = ""
}) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="bg-gray-50 p-4 rounded-full mb-4">
        <Icon className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title || t('emptyState.defaultTitle') || "لا توجد بيانات"}
      </h3>
      
      {description && (
        <p className="text-gray-500 text-sm max-w-xs mb-6">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
