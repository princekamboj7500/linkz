import {LegacyCard, EmptyState} from '@shopify/polaris';
import { useSearchParams, useNavigate } from "react-router-dom";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  var shop = searchParams.get('shop');
  return (
    <LegacyCard sectioned>
      <EmptyState
        heading="Linkz actived on your live theme"
        action={{content: 'Settings', url: 'https://'+shop+'/admin/themes/current/editor?context=apps&activateAppId=5ef468ec-31ee-44cc-bbf3-8d76e2b2f819/app-embed-block'}}
        secondaryAction={{
          content: 'Learn more',
          url: 'https://help.shopify.com',
        }}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>Track your links as preview in popover.</p>
      </EmptyState>
    </LegacyCard>
  );
}
