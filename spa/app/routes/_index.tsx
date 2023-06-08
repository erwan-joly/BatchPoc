import { useQuery } from "@apollo/client";
import { GetNumberDocument } from "../../gql/graphql";
import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export default function Index() {
  const { data: firstData } = useQuery(GetNumberDocument, {
    variables: {
      prop: 123,
    },
  });

  const { data: secondData } = useQuery(GetNumberDocument, {
    variables: {
      prop: 500,
    },
  });

  return (
    <div>
      firstData: {firstData?.number}
      secondDate: {secondData?.number}
    </div>
  );
}
