declare global {
  interface Window {
    require?: (module: string) => any;
  }
}

export const isElectron = (): boolean => {
  return !!(window && window.require);
};

const getElectron = () => {
  if (window.require) {
    return window.require('electron');
  }
  return null;
};

export const saveFileDialog = async (
  defaultPath: string,
  filters: { name: string; extensions: string[] }[]
): Promise<{ canceled: boolean; filePath?: string }> => {
  const electron = getElectron();
  if (electron) {
    const result = await electron.ipcRenderer.invoke('save-file', {
      defaultPath,
      filters
    });
    return result;
  }
  return { canceled: true };
};

export const writeFile = async (filePath: string, content: string): Promise<{ success: boolean; error?: string }> => {
  const electron = getElectron();
  if (electron) {
    const result = await electron.ipcRenderer.invoke('write-file', {
      filePath,
      content
    });
    return result;
  }
  return { success: false, error: 'Not in electron environment' };
};

export const exportFile = async (
  fileName: string,
  content: string,
  fileType: string = 'text/html'
): Promise<boolean> => {
  if (isElectron()) {
    const filters = [
      { name: 'HTML 文件', extensions: ['html'] },
      { name: '所有文件', extensions: ['*'] }
    ];
    const result = await saveFileDialog(fileName, filters);
    if (result.canceled || !result.filePath) {
      return false;
    }
    const writeResult = await writeFile(result.filePath, content);
    return writeResult.success;
  } else {
    const blob = new Blob([content], { type: `${fileType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }
};
