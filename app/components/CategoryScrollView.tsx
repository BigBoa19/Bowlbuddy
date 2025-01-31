// CategoryScrollView.tsx
import React, { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import CustomButton from './CustomButton';
import { InteractionManager } from 'react-native';

interface CategoryScrollViewProps {
  toggleCategories: {
    science: boolean;
    history: boolean;
    finearts: boolean;
    literature: boolean;
    mythology: boolean;
  };
  handleCategoryPress: (categories: string[]) => void;
  scrollPosition: React.MutableRefObject<number>;
}

const CategoryScrollView: React.FC<CategoryScrollViewProps> = ({
  toggleCategories,
  handleCategoryPress,
  scrollPosition,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Defer the scroll restoration until after interactions and layout
    const task = InteractionManager.runAfterInteractions(() => {
      scrollViewRef.current?.scrollTo({ x: scrollPosition.current, animated: false });
    });

    return () => task.cancel();
  }, [toggleCategories, scrollPosition]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      ref={scrollViewRef}
      onScroll={(event) => {
        scrollPosition.current = event.nativeEvent.contentOffset.x;
      }}
      scrollEventThrottle={16}
      style={{ flexDirection: 'row' }}
    >
      <CustomButton
        title='Science'
        isActive={toggleCategories.science}
        handlePress={() => handleCategoryPress(["Science"])}
        containerStyles='mt-2 mr-2'
      />
      <CustomButton
        title='History'
        isActive={toggleCategories.history}
        handlePress={() => handleCategoryPress(["History"])}
        containerStyles='mt-2 mx-2'
      />
      <CustomButton
        title='Fine Arts'
        isActive={toggleCategories.finearts}
        handlePress={() => handleCategoryPress(["Fine Arts"])}
        containerStyles='mt-2 mx-2'
      />
      <CustomButton
        title='Literature'
        isActive={toggleCategories.literature}
        handlePress={() => handleCategoryPress(["Literature"])}
        containerStyles='mt-2 mx-2'
      />
      <CustomButton
        title='Mythology'
        isActive={toggleCategories.mythology}
        handlePress={() => handleCategoryPress(["Mythology"])}
        containerStyles='mt-2 ml-2'
      />
    </ScrollView>
  );
};

// Custom comparison to prevent unnecessary re-renders
const areEqual = (prevProps: CategoryScrollViewProps, nextProps: CategoryScrollViewProps) => {
  return (
    prevProps.toggleCategories.science === nextProps.toggleCategories.science &&
    prevProps.toggleCategories.history === nextProps.toggleCategories.history &&
    prevProps.toggleCategories.finearts === nextProps.toggleCategories.finearts &&
    prevProps.toggleCategories.literature === nextProps.toggleCategories.literature &&
    prevProps.toggleCategories.mythology === nextProps.toggleCategories.mythology
  );
};

export default React.memo(CategoryScrollView, areEqual);
