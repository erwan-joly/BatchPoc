import { useLazyQuery, useQuery } from "@apollo/client";
import { GetNumberDocument } from "../../gql/graphql";
import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export default function Index() {
  const { data: firstData, refetch } = useQuery(GetNumberDocument, {
    variables: {
      prop: 123,
    },
  });

  const { data: secondData, refetch: refetch2 } = useQuery(GetNumberDocument, {
    variables: {
      prop: 500,
    },
  });

  
  const [lazyquery, {data: lazyData}] = useLazyQuery(GetNumberDocument, {
    variables: {
      prop: 500,
    },
  });

  const onClick = async () => {
    await refetch({
      prop: 5555,
    });
    await lazyquery({
      variables: {
        prop: 5556,
      }
    })
    await refetch2({
      prop: 5557,
    })
  }

  return (
    <div>
      <div onClick={onClick}>click to refresh</div>
      firstData: {firstData?.number}
      secondDate: {secondData?.number}
      lazyData: {lazyData?.number}
    </div>
  );
}
