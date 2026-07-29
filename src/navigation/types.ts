import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  TalentProfile: { talentId: string };
  JobDetail: { jobId: string };
  Apply: { jobId: string };
  Chat: { conversationId: string };
  Notifications: undefined;
  EditProfile: undefined;
  Favorites: undefined;
  SavedJobs: undefined;
};

export type TabParamList = {
  Discover: undefined;
  Search: undefined;
  Castings: undefined;
  Inbox: undefined;
  Profile: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
