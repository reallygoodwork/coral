import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from "fumadocs-ui/layouts/home/navbar";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        {
          type: "custom",
          on: "nav",
          children: (
            <NavbarMenu>
              <NavbarMenuTrigger>Packages</NavbarMenuTrigger>
              <NavbarMenuContent>
                <NavbarMenuLink href="/docs/packages/core">Core</NavbarMenuLink>
                <NavbarMenuLink href="/docs/packages/tw2css">Tailwind to CSS</NavbarMenuLink>
                <NavbarMenuLink href="/docs/packages/style-to-tailwind">Style to Tailwind</NavbarMenuLink>
                <NavbarMenuLink href="/docs/packages/react-to-coral">React to Coral</NavbarMenuLink>
                <NavbarMenuLink href="/docs/packages/coral-to-react">Coral to React</NavbarMenuLink>
                <NavbarMenuLink href="/docs/packages/coral-to-html">Coral to HTML</NavbarMenuLink>
              </NavbarMenuContent>
            </NavbarMenu>
          ),
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
