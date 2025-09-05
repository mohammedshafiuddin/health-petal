import { Drawer } from "expo-router/drawer";
import React, { useEffect } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";

// import { useQueryClient } from "@tanstack/react-query";

import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";

import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {IconButton } from "react-native-paper";
import { colors } from "@/lib/theme-colors";
import tw from "../tailwind";
import { useTheme } from "../hooks/theme.context";
import MyText from "@/components/text";
import MyButton from "@/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { useRoles } from "@/components/context/roles-context";
import { useAuth } from "@/components/context/auth-context";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useGetUserById } from "../../api-hooks/user.api";
import { useGetMyDoctors } from "@/api-hooks/my-doctors.api";
import { ROLE_NAMES } from "@/lib/constants";


interface Props {}

function _layout(props: Props) {
  const {} = props;
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const { roles, refreshRoles } = useRoles();
  const isAdmin = roles?.includes("admin");
  const router = useRouter();

  useEffect(() => {
    refreshRoles();
  }, []);

  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = React.useState(false);

  const handleRefersh = () => {
    // if (spinning) return;
    // setSpinning(true);
    // Animated.timing(spinAnim, {
    //   toValue: 1,
    //   duration: 600,
    //   easing: Easing.linear,
    //   useNativeDriver: true,
    // }).start(() => {
    //   spinAnim.setValue(0);
    //   setSpinning(false);
    //   queryClient.clear();
    //   queryClient.removeQueries();
    //   queryClient.resetQueries({
    //     exact: false,
    //     type: "all",
    //   });
    //   setCount((val) => val + 1);
    //   emitRefreshEvent();
    // });
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={{ flexGrow: 1, backgroundColor: "#fff" }}>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: true,
            headerRight: () => (
              <View style={tw`flex flex-row`}>
                <View style={tw`-mr-4`}>
                  <IconButton
                    icon="bell"
                    size={24}
                    accessibilityLabel="Notifications"
                    onPress={() =>
                      router.push("/(drawer)/notifications" as any)
                    }
                    iconColor={colors.blue1}
                  />
                </View>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <IconButton
                    icon="refresh"
                    size={24}
                    onPress={handleRefersh}
                    accessibilityLabel="Refresh"
                    disabled={spinning}
                    iconColor={colors.blue1}
                  />
                </Animated.View>
              </View>
            ),
          }}
        >
          <Drawer.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
              headerShown: true, // Show header only for dashboard root
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <MaterialCommunityIcons
                  color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="view-dashboard-outline"
                  size={24}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="login"
            options={{
              title: "Login",
              headerShown: true, // Show header only for dashboard root
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <MaterialCommunityIcons
                  color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="view-dashboard-outline"
                  size={24}
                />
              ),
            }}
          />

          {/* <Drawer.Screen
            name="new-ride"
            options={{
              title: "Create New Ride",
              headerShown: true,
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <Ionicons
                  color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="add-circle-outline"
                  size={24}
                />
              ),
            }}
          /> */}
          {/* <Drawer.Screen
            name="my-rides"
            options={{
              title: "My Rides",
              headerShown: true,
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <Ionicons
                //   color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="car-sport-outline"
                  size={24}
                />
              ),
            }}
          /> */}
          {/* <Drawer.Screen
            name="my-cars"
            options={{
              title: "My Cars",
              headerShown: true,
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <Ionicons
                //   color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="car-outline"
                  size={24}
                />
              ),
            }}
          /> */}
          {/* <Drawer.Screen
            name="home"
            options={{
              title: "Home",
              headerShown: true,
            }}
          />

          <Drawer.Screen
            name="admin-connect"
            options={{
              title: "Admin Connect",
              headerShown: true,
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <MaterialIcons
                //   color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="support-agent"
                  size={24}
                />
              ),
            }}
          /> */}
          {/* <Drawer.Screen
            name="announcements"
            options={{
              title: "Announcements",
              headerShown: true,
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <Ionicons
                //   color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="megaphone-outline"
                  size={24}
                />
              ),
            }}
          /> */}
          <Drawer.Screen
            name="admin-panel"
            options={{
              title: "Admin Panel",
              headerShown: true,
            //   drawerItemStyle: isAdmin ? {} : { display: "none" },
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <Ionicons
                //   color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="settings-outline"
                  size={24}
                />
              ),
            }}
          />
          {/* <Drawer.Screen
            name="profile"
            options={{
              title: "My Profile",
              headerShown: true,
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <Ionicons
                //   color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="person-outline"
                  size={24}
                />
              ),
            }}
          /> */}
          {/* <Drawer.Screen
            name="users"
            options={{
              title: "Users",
              drawerItemStyle: { display: "none" },
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <Ionicons
                //   color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="people-outline"
                  size={24}
                />
              ),
            }}
          /> */}
          {/* <Drawer.Screen
            name="notifications"
            options={{
              title: "Notifications",
              headerShown: true,
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <Ionicons
                //   color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="notifications-outline"
                  size={24}
                />
              ),
            }}
          /> */}
          {/* <Drawer.Screen
            name="not-found"
            options={{
              title: "Not Found",
              headerShown: true,
              drawerItemStyle: { display: "none" },
              drawerIcon: ({
                color,
                focused,
              }: {
                focused: boolean;
                color: string;
              }) => (
                <Ionicons
                //   color={focused ? theme.colors.blue1 : theme.colors.gray1}
                  name="warning-outline"
                  size={24}
                />
              ),
            }}
          /> */}
        </Drawer>
    </View>
  );
}

export default _layout;

function CustomDrawerContent(props: any) {
  const { theme } = useTheme();
  const userId = useCurrentUserId();
  const { data: user } = useGetUserById(userId || undefined);
  const router = useRouter();
  
  const isHospitalAdmin = useRoles().roles?.includes(ROLE_NAMES.HOSPITAL_ADMIN);
  const isDoctorSecretary = useRoles().roles?.includes(ROLE_NAMES.DOCTOR_SECRETARY);
  const shouldFetchMyDoctors = Boolean(isHospitalAdmin) || Boolean(isDoctorSecretary);
  const { data: myDoctors } = useGetMyDoctors({
    enabled: shouldFetchMyDoctors,
  });

  const hiddenRoutes = ["users", "home", "notifications", "not-found", 'login', 'signup'];
  const adminOnlyRoutes = ["admin-panel"];
  const { logout } = useAuth();
  const { roles, refreshRoles } = useRoles();
  const isAdmin = roles?.includes("admin");
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        style={{ height: "100%", backgroundColor: "#fff" }}
      >
        {user && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 96,
              backgroundColor: theme.colors.blue1,
              borderRadius: 4,
              paddingVertical: 8,
              paddingHorizontal: 16,
              paddingBottom: 16,
            }}
          >
            {user.profilePicUrl ? (
              <Image
                source={{ uri: user.profilePicUrl }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 48,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: "#fff",
                }}
              />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                  borderColor: "#fff",
                }}
              >
                <MyText weight="bold" color="white1" style={{ fontSize: 32 }}>
                  {user.name?.[0] || "?"}
                </MyText>
              </View>
            )}
            <View>
              <MyText weight="bold" color="white1" style={{ fontSize: 18 }}>
                {user.name}
              </MyText>
              <MyText color="white1" style={{ fontSize: 12 }}>
                {user.mobile}
              </MyText>
            </View>
          </View>
        )}
        {props.state.routes.map((route: any, index: any) => {
          const { options } = props.descriptors[route.key];
          const isFocused = props.state.index === index;
          if (
            hiddenRoutes.includes(route.name) ||
            (!isAdmin && adminOnlyRoutes.includes(route.name))
          ) {
            return null;
          }
          return (
            <React.Fragment key={route.key}>
              <DrawerItem
                key={index}
                label={({
                  focused,
                  color,
                }: {
                  focused: boolean;
                  color: string;
                }) => {
                  return (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <MyText
                        weight={focused ? "bold" : "light"}
                        color={focused ? "blue1" : "gray1"}
                      >
                        {options.title}
                      </MyText>
                      <MaterialIcons
                        name="chevron-right"
                        color={
                          focused ? theme.colors.blue1 : theme.colors.gray1
                        }
                        size={24}
                        weight={focused ? "700" : "400"}
                      />
                    </View>
                  );
                }}
                onPress={() => props.navigation.navigate(route.name)}
                focused={isFocused}
                activeBackgroundColor={theme.colors.white1}
                icon={options.drawerIcon}
              />
              <View style={{ opacity: 0.5 }}>
                {/* <HorizSeparator verticalGap={2} /> */}
              </View>
            </React.Fragment>
          );
        })}
        
        {/* My Doctors Section */}
        {shouldFetchMyDoctors && myDoctors && myDoctors.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <View style={{ 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              backgroundColor: theme.colors.gray3,
              marginBottom: 8 
            }}>
              <MyText weight="bold" color="blue1">My Doctors</MyText>
            </View>
            
            {myDoctors.map((doctor) => (
              <DrawerItem
                key={`doctor-${doctor.id}`}
                label={({
                  focused,
                  color,
                }: {
                  focused: boolean;
                  color: string;
                }) => (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <MaterialIcons
                        name="person"
                        color={theme.colors.blue1}
                        size={18}
                        style={{ marginRight: 8 }}
                      />
                      <MyText
                        weight={focused ? "bold" : "light"}
                        color={focused ? "blue1" : "gray1"}
                        numberOfLines={1}
                        style={{ maxWidth: 150 }}
                      >
                        {doctor.name}
                      </MyText>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      color={theme.colors.gray1}
                      size={20}
                    />
                  </View>
                )}
                onPress={() => router.push(`/(drawer)/dashboard/doctor-details/${doctor.id}` as any)}
                activeBackgroundColor={theme.colors.white1}
              />
            ))}
          </View>
        )}
      </DrawerContentScrollView>
      <View
        style={{
          padding: 16,
          backgroundColor: theme.colors.white1,
          borderTopWidth: 1,
          borderTopColor: theme.colors.gray3,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <MyButton
          onPress={() => logout({})}
          style={{ flexGrow: 1, marginBottom: 16, marginHorizontal: 8 }}
        >
          Logout
        </MyButton>
      </View>
    </View>
  );
}
