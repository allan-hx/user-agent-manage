import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getHostname } from '@/lib/utils';
import { Cat, Save, Trash2 } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from 'react';

interface Item {
  // hostname
  key: string;
  // ua
  value: string;
}

export default React.memo(function App() {
  // 当前hostname
  const [hostname, setHostname] = useState('');
  // 全部设置数据
  const [data, setData] = useState<Item[]>([]);
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
    await chrome.storage.local.set({
      [hostname]: value,
    });
    setExist(true);
    setData([{ key: hostname, value }, ...data]);
    updateDynamicRules();
  }, [hostname, value, data, updateDynamicRules]);

  const onRemove = useCallback(
    async (key: string) => {
      await chrome.storage.local.remove(key);
      setData(data.filter((item) => item.key !== key));
      updateDynamicRules();
    },
    [data, updateDynamicRules],
  );

  const onInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value.trim());
  }, []);

  const onRemoveCurrent = useCallback(async () => {
    await onRemove(hostname);
    setValue('');
    setExist(false);
  }, [hostname, onRemove]);

  const init = useCallback(async () => {
    const hostname = await getHostname();
    const result = await chrome.storage.local.get();

    if (hostname in result) {
      setExist(true);
      setValue(result[hostname]);
    }

    const data = Object.keys(result).map((key) => ({
      key,
      value: result[key],
    }));

    setData(data);
    setHostname(hostname);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="w-[360px] h-[500px] py-3 flex flex-col mx-auto bg-background">
      {data.length ? (
        <ScrollArea className="flex-1 min-h-0 px-3">
          <div className="flex flex-col gap-3">
            {data.map((item) => (
              <div
                key={item.key}
                className="flex items-center border border-dashed p-3 rounded-sm hover:border-[var(--primary)] hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="text-[12px] font-extrabold mb-0.5">
                    hostname: {item.key}
                  </div>
                  <div className="text-[12px]">ua: {item.value}</div>
                </div>
                <Trash2
                  className="size-[17px] cursor-pointer hover:opacity-60 hover:text-destructive"
                  onClick={() =>
                    item.key === hostname
                      ? onRemoveCurrent()
                      : onRemove(item.key)
                  }
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <Cat
            color="var(--muted-foreground)"
            className="size-28 opacity-20"
            strokeWidth={1}
          />
        </div>
      )}
      <div className="flex gap-2 p-3">
        <Input
          autoFocus
          className="text-[14px] border-dashed"
          placeholder="Please enter the User agent"
          value={value}
          onInput={onInput}
        />
        <Button
          variant="outline"
          size="icon"
          className="border-dashed"
          disabled={!value.length}
          onClick={onSave}
        >
          <Save />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-dashed"
          disabled={!isExist}
          onClick={onRemoveCurrent}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
});
