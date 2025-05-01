import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getHostname } from '@/lib/utils';
import { Save, Trash2 } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from 'react';

export default React.memo(function App() {
  // 当前输入的值
  const [value, setValue] = useState('');
  // 是否存在User Agent
  const [isExist, setExist] = useState(false);

  const updateDynamicRules = useCallback(() => {
    chrome.runtime.sendMessage({
      action: 'update-dynamic-rules',
    });
  }, []);

  const onSave = useCallback(async () => {
    const origin = await getHostname();
    await chrome.storage.local.set({
      [origin]: value,
    });
    setExist(true);
    updateDynamicRules();
  }, [value, updateDynamicRules]);

  const onRemove = useCallback(async () => {
    const origin = await getHostname();
    await chrome.storage.local.remove(origin);
    setExist(false);
    setValue('');
    updateDynamicRules();
  }, [updateDynamicRules]);

  const onInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value.trim());
  }, []);

  useEffect(() => {
    (async () => {
      const origin = await getHostname();
      const result = await chrome.storage.local.get(origin);

      if (origin in result) {
        setExist(true);
        setValue(result[origin]);
      }
    })();
  }, []);

  return (
    <div className="w-[360px] h-[500px] flex flex-col mx-auto bg-background">
      <ul className="flex flex-col flex-1 bg-red-300" />
      <div className="flex gap-2 p-4">
        <Input
          autoFocus
          className="text-[14px]"
          placeholder="Please enter the User Agent string"
          value={value}
          onInput={onInput}
        />
        <Button
          variant="outline"
          size="icon"
          disabled={!value.length}
          onClick={onSave}
        >
          <Save />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={!isExist}
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
});
